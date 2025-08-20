import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectToDatabase from '@/utils/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Ensure this route runs on the Node.js runtime (not Edge)
export const runtime = 'nodejs';

export const authOptions = {
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        const user = await User.findOne({ username: credentials.username });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { id: user._id.toString(), name: user.username };
      },
    }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
            scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata'
          }
        }
      }),
  ],
  pages: {
    signIn: "/login",
  },
    callbacks: {
      async signIn({ user, account, profile }) {
        if (account?.provider === 'google') {
          await connectToDatabase();
          const email = profile?.email?.toLowerCase();
          const name = profile?.name || profile?.given_name || profile?.email?.split('@')[0];
          const image = profile?.picture;

          let existing = await User.findOne({ email });
          if (!existing) {
            existing = await User.create({
              email,
              name,
              image,
              provider: 'google',
              providerId: profile?.sub || account?.providerAccountId,
              username: email?.split('@')[0],
            });
          }

          user.id = existing._id.toString();
          user.name = existing.name || existing.username || name;
          user.email = existing.email || email;
          user.image = existing.image || image;
        }
        return true;
      },
      async jwt({ token, user, account }) {
        // Initial sign in
        if (account && user) {
          token.uid = user.id;
          if (account.provider === 'google') {
            token.provider = 'google';
            token.googleAccessToken = account.access_token;
            token.googleRefreshToken = account.refresh_token;
            token.googleAccessTokenExpires = Date.now() + (account.expires_in ? account.expires_in * 1000 : 0);
          }
        }

        // Return previous token if the access token has not expired yet
        if (token.provider === 'google' && token.googleAccessToken && token.googleAccessTokenExpires) {
          if (Date.now() < token.googleAccessTokenExpires - 60_000) {
            return token;
          }
          // Try to refresh the access token
          try {
            const params = new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID || '',
              client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
              grant_type: 'refresh_token',
              refresh_token: token.googleRefreshToken || ''
            });
            const res = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: params.toString()
            });
            if (!res.ok) throw new Error('Failed to refresh Google access token');
            const refreshed = await res.json();
            token.googleAccessToken = refreshed.access_token;
            token.googleAccessTokenExpires = Date.now() + refreshed.expires_in * 1000;
            if (refreshed.refresh_token) token.googleRefreshToken = refreshed.refresh_token;
          } catch (e) {
            console.error('Error refreshing Google access token', e);
          }
        }
        return token;
      },
      async session({ session, token }) {
        if (session?.user) {
          session.user.id = token?.uid;
          session.user.provider = token?.provider || 'credentials';
          // Expose a flag to the app (do not expose tokens to client)
          session.user.hasGoogleDrive = token?.provider === 'google';
        }
        return session;
      },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
