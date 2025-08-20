# Taskence

A modern task management application built with Next.js 15, NextAuth.js for authentication, MongoDB for data storage, and Tailwind CSS for styling.

## Features

- 🔐 **User Authentication** - Secure login/signup with NextAuth.js, including Google OAuth
- ✅ **Task Management** - Create, read, update, and delete tasks
- 🏷️ **Task Categories** - Organize tasks by category
- ⭐ **Priority Marking** - Mark tasks as important
- 📊 **Status Tracking** - Track task status (Pending, In Progress, Completed)
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Deployment**: Vercel-ready
- **Icons**: Lucide React

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- MongoDB database (local or cloud)
- npm or yarn package manager

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd taskence
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration (Required for authentication to work)
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Environment Variables Explained:

- **MONGODB_URI**: Your MongoDB connection string (MongoDB Atlas or local MongoDB)
- **NEXTAUTH_SECRET**: A secure secret key for JWT encryption (generate with `openssl rand -base64 32`)
- **NEXTAUTH_URL**: The base URL of your application (use `http://localhost:3000` for development)
- **GOOGLE_CLIENT_ID**: Your Google OAuth Client ID
- **GOOGLE_CLIENT_SECRET**: Your Google OAuth Client Secret

### 4. Generate NextAuth Secret

Generate a secure secret key for production:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -base64 32
```

### 5. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create OAuth Client ID (Web application).
3. Authorized JavaScript origins: `http://localhost:3000`
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret into your `.env.local` file.

### 6. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. **Sign Up**: Create a new account on the signup page
2. **Login**: Sign in with your credentials
3. **Dashboard**: View all your tasks on the main dashboard
4. **Add Task**: Click "Add Task" to create a new task with:
   - Title and description
   - Category selection
   - Priority level (important/normal)
   - Status (Pending, In Progress, Completed)
5. **Manage Tasks**: Edit, delete, or update task status as needed

## API Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[taskId]` - Update task
- `DELETE /api/tasks/[taskId]` - Delete task

## Project Structure

```
taskence/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── globals.css        # Global styles
├── components/            # React components
├── models/               # Mongoose models
├── utils/                # Utility functions
└── public/               # Static assets
```

## Troubleshooting

### Authentication Issues

If you encounter JWT decryption errors:

1. Ensure `NEXTAUTH_SECRET` is set in your `.env.local` file
2. Clear browser cookies for localhost:3000
3. Restart the development server
4. Try logging in again

### Database Connection Issues

1. Verify your `MONGODB_URI` is correct
2. Ensure your MongoDB service is running
3. Check network connectivity if using MongoDB Atlas

## Deployment

### Deploy on Vercel

1. Push your code to a Git repository
2. Import your project on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's dashboard (Production and Preview)
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = your production URL (only in Production)
   - `AUTH_TRUST_HOST` = `true` (recommended to simplify previews)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
4. In Google Cloud Console → OAuth client, add:
   - Authorized origins: your production URL, and optionally preview `https://*.vercel.app`
   - Redirect URIs: `https://your-app.vercel.app/api/auth/callback/google` and optionally preview callback
5. Deploy

If your API routes or NextAuth fail on Vercel, check Functions logs and confirm env vars are present. Ensure Atlas IP allowlist includes 0.0.0.0/0 or your egress IP.

Security note: never commit `.env.local`. If secrets leaked, rotate in MongoDB Atlas, Google Cloud, and update Vercel.

### Environment Variables for Production

Make sure to set these environment variables in your production deployment:

- `MONGODB_URI`
- `NEXTAUTH_SECRET` (use a secure random string)
- `NEXTAUTH_URL` (your production domain)
- `GOOGLE_CLIENT_ID` (your Google OAuth Client ID)
- `GOOGLE_CLIENT_SECRET` (your Google OAuth Client Secret)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
