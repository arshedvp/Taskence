# Vercel Deployment Checklist for Taskence

## ✅ Code Changes Made
- [x] Removed problematic vercel.json file 
- [x] Added runtime='nodejs' exports to all API routes
- [x] Updated MongoDB URI in .env.local
- [x] Added health check endpoint at /api/health
- [x] Fixed package.json naming issue

## 🚀 Deploy to Vercel

### Step 1: Push Code (if needed)
```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

### Step 2: Set Environment Variables in Vercel
Go to Vercel → Your Project → Settings → Environment Variables

**Production Environment Variables:**
- `MONGODB_URI` = `your_mongodb_connection_string_from_atlas`
- `NEXTAUTH_SECRET` = `your_nextauth_secret_key`
- `NEXTAUTH_URL` = `https://your-app.vercel.app` 
- `AUTH_TRUST_HOST` = `true`
- `GOOGLE_CLIENT_ID` = `your_google_oauth_client_id`
- `GOOGLE_CLIENT_SECRET` = `your_google_oauth_client_secret`

**Preview Environment Variables:**
Copy the same variables except:
- Omit `NEXTAUTH_URL` (or set to your preview domain)
- Keep `AUTH_TRUST_HOST` = `true`

### Step 3: Update Google OAuth Settings
Go to Google Cloud Console → APIs & Services → Credentials

Add these to your OAuth client:
- **Authorized JavaScript origins:**
  - `https://your-app.vercel.app`
  - `https://*.vercel.app` (for previews)

- **Authorized redirect URIs:**
  - `https://your-app.vercel.app/api/auth/callback/google`
  - `https://*.vercel.app/api/auth/callback/google` (for previews)

### Step 4: Deploy
- Go to Vercel Dashboard → Your Project → Deployments
- Click "Redeploy" or trigger a new deployment

## 🧪 Test After Deployment

1. **Health Check:** Visit `https://your-app.vercel.app/api/health`
   - Should return: `{"ok":true}`

2. **NextAuth:** Visit `https://your-app.vercel.app/api/auth/signin`
   - Should show the sign-in page

3. **Test Sign-in:** Try both Google OAuth and credentials login

## 🔧 Troubleshooting

If you see errors:
1. Check Vercel → Functions → View Function Logs
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
4. Check Google OAuth settings match your domain

## 🔒 Security Note
The credentials in .env.local are exposed in this chat. After deployment:
1. Rotate your MongoDB password in Atlas
2. Generate a new NEXTAUTH_SECRET
3. Consider rotating Google OAuth credentials
4. Update all environment variables with new values

**Your actual values to use in Vercel:**
- Copy from your .env.local file for the actual credential values
- Never commit real credentials to git repositories
