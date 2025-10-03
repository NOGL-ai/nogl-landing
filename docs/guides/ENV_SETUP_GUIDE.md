# Environment Variables Setup Guide

## Quick Start - Minimal Required Variables

Create a `.env.local` file in your project root with these **essential** variables:

```env
# ===== REQUIRED FOR BASIC FUNCTIONALITY =====
NEXTAUTH_URL=http://nogl.ai:3000
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long
DATABASE_URL="postgresql://username:password@nogl.ai:5432/nogl_db"

# ===== GOOGLE OAUTH (REQUIRED) =====
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ===== DOMAIN CONFIGURATION =====
NEXT_PUBLIC_DOMAIN=nogl.ai:3000
NEXT_PUBLIC_APP_SUBDOMAIN=app
```

## How to Get Required Values

### 1. Generate NEXTAUTH_SECRET

```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

Or use: [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

### 2. Database Setup (PostgreSQL)

#### Option A: Local PostgreSQL

```env
DATABASE_URL="postgresql://postgres:password@nogl.ai:5432/nogl_dev"
```

#### Option B: Supabase (Free)

1. Go to [https://supabase.com](https://supabase.com)
2. Create new project
3. Copy the connection string from Settings > Database

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### Option C: Neon (Free)

1. Go to [https://neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set authorized redirect URIs:
   - `http://nogl.ai:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)

## Complete Environment Variables

### Core Application

```env
NEXTAUTH_URL=http://nogl.ai:3000
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long
DATABASE_URL="postgresql://username:password@nogl.ai:5432/nogl_db"
```

### Domain Configuration (SaaS)

```env
NEXT_PUBLIC_DOMAIN=nogl.ai:3000
NEXT_PUBLIC_APP_SUBDOMAIN=app
NEXT_PUBLIC_AUTH_SUBDOMAIN=
```

### Authentication

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Provider (for magic links)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Payment Providers (Optional)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# LemonSqueezy
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
```

### File Upload (Optional)

```env
UPLOADTHING_SECRET=sk_live_your_uploadthing_secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### Analytics (Optional)

```env
NEXT_PUBLIC_GOOGLE_TAG_ID=G-XXXXXXXXXX
```

### AI Services (Optional)

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

## Production Environment

For production, update these values:

```env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_DOMAIN=yourdomain.com
DATABASE_URL="postgresql://username:password@production-host:5432/nogl_prod"
NODE_ENV=production
```

## Setup Steps

1. **Copy the template**:

   ```bash
   cp ENV_SETUP_GUIDE.md .env.local
   # Edit .env.local with your actual values
   ```

2. **Install dependencies** (if not done):

   ```bash
   npm install
   ```

3. **Setup database**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development server**:

   ```bash
   npm run dev
   ```

## Common Issues & Solutions

### Database Connection Issues

- Ensure PostgreSQL is running
- Check connection string format
- Verify database exists

### Google OAuth Issues

- Check redirect URIs match exactly
- Ensure Google+ API is enabled
- Verify client ID and secret

### Port Issues

- If port 3000 is busy, the app will use 3001
- Update NEXTAUTH_URL accordingly

### File Permission Issues

```bash
# Run cleanup script
npm run clean:win  # Windows
npm run clean      # Mac/Linux
```

## Security Notes

1. **Never commit `.env.local`** - it's in `.gitignore`
2. **Use different secrets** for development and production
3. **Rotate secrets regularly**
4. **Use environment-specific API keys**

## Need Help?

1. Check the terminal for specific error messages
2. Verify all required environment variables are set
3. Ensure database is accessible
4. Check OAuth provider configuration

Your app should now work with these environment variables!
