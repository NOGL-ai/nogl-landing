# Environment Configuration Guide

## Overview

This document outlines the environment configuration for the SaaS platform with subdomain routing support.

## Required Environment Variables

### 1. Core Configuration

```env
# Application URL (Required)
NEXTAUTH_URL=http://nogl.ai:3000  # Development
NEXTAUTH_URL=https://yourdomain.com  # Production

# NextAuth Secret (Required - Generate a secure random string)
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters
```

### 2. Domain Configuration

```env
# Main Domain Configuration
NEXT_PUBLIC_DOMAIN=nogl.ai:3000     # Development
NEXT_PUBLIC_DOMAIN=yourdomain.com     # Production

# Subdomain Configuration
NEXT_PUBLIC_APP_SUBDOMAIN=app         # App subdomain (app.yourdomain.com)
NEXT_PUBLIC_AUTH_SUBDOMAIN=           # Leave empty to use main domain for auth
```

### 3. Database Configuration

```env
# PostgreSQL Database URL
DATABASE_URL=postgresql://user:password@nogl.ai:5432/dbname
```

### 4. Authentication Providers

#### Google OAuth

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Email Provider (Magic Links)

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### 5. Payment Providers (Optional)

#### Stripe

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### LemonSqueezy

```env
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
```

#### Paddle

```env
PADDLE_API_KEY=your-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret
```

### 6. File Upload (Optional)

```env
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-app-id
```

### 7. Analytics (Optional)

```env
NEXT_PUBLIC_GOOGLE_TAG_ID=G-XXXXXXXXXX
```

### 8. AI Services (Optional)

```env
OPENAI_API_KEY=sk-...
```

## Development Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` with your configuration.

3. For local development with subdomains, add to your hosts file:

   ```text
   127.0.0.1 nogl.ai
   127.0.0.1 app.nogl.ai
   127.0.0.1 auth.nogl.ai
   ```

## Production Deployment

### Vercel Deployment

1. Add all environment variables in Vercel Dashboard
2. Set up domain configuration:
   - Add your main domain: `yourdomain.com`
   - Add app subdomain: `app.yourdomain.com`
   - Add auth subdomain: `auth.yourdomain.com` (if using separate auth domain)

### DNS Configuration

Add the following DNS records:

```text
Type  Name    Value
A     @       Your-Server-IP
A     app     Your-Server-IP
A     auth    Your-Server-IP  (if using separate auth domain)
```

Or for Vercel:

```text
Type  Name    Value
CNAME @       cname.vercel-dns.com
CNAME app     cname.vercel-dns.com
CNAME auth    cname.vercel-dns.com  (if using separate auth domain)
```

## Security Notes

1. **Never commit `.env.local` or any file containing secrets**
2. **Generate secure random strings for secrets:**

   ```bash
   openssl rand -base64 32
   ```

3. **Use different credentials for development and production**
4. **Rotate secrets regularly**
5. **Use environment-specific API keys**

## Subdomain Routing Behavior

The application uses subdomain routing with the following behavior:

### Main Domain (yourdomain.com)

- Landing page
- Marketing pages (pricing, about, blog)
- Public content

### App Subdomain (app.yourdomain.com)

- Dashboard
- User/Admin panels
- Protected application routes
- Requires authentication

### Auth Flow

- Sign in/up can be on main domain or auth subdomain
- After authentication, redirects to app subdomain
- Automatic role-based routing (admin/user)

## Troubleshooting

### Local Subdomain Issues

If subdomains don't work locally:

1. Check hosts file configuration
2. Use `127.0.0.1` instead of `nogl.ai`
3. Access via `http://app.nogl.ai:3000`

### Production Subdomain Issues

1. Verify DNS propagation (can take up to 48 hours)
2. Check SSL certificate includes subdomains
3. Verify middleware configuration in `src/middleware.ts`

### Authentication Issues

1. Verify `NEXTAUTH_URL` matches your domain
2. Check `NEXTAUTH_SECRET` is set
3. Ensure OAuth callback URLs are correct
4. Check database connection

## Support

For issues or questions:

1. Check the logs in your deployment platform
2. Review the middleware configuration
3. Verify all required environment variables are set
4. Check the browser console for client-side errors
