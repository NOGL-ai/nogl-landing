# Environment Setup Guide

## Quick Fix for Current Errors

You're encountering two main errors that need to be fixed:

### 1. Ghost Content API Configuration Error

**Error**: `@tryghost/content-api Config Missing: 'url' is required`

**Solution**: Create a `.env.local` file in your project root with the following content:

```env
# Ghost Content API Configuration
NEXT_PUBLIC_GHOST_URL=https://your-ghost-blog.com
NEXT_PUBLIC_GHOST_CONTENT_API_KEY=your-ghost-content-api-key-here
```

**To get your Ghost Content API key:**
1. Go to your Ghost admin panel
2. Navigate to Settings > Integrations
3. Create a new Custom Integration
4. Copy the Content API Key from the integration details

### 2. Clipboard Permissions Error

**Error**: `NotAllowedError: Failed to execute 'writeText' on 'Clipboard'`

**Solution**: This has been fixed by adding the necessary permissions policy to `next.config.js`. The application will now handle clipboard errors gracefully.

## Complete Environment Variables

For a full setup, create a `.env.local` file with these variables:

```env
# Ghost Content API Configuration
NEXT_PUBLIC_GHOST_URL=https://your-ghost-blog.com
NEXT_PUBLIC_GHOST_CONTENT_API_KEY=your-ghost-content-api-key-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters

# Domain Configuration
NEXT_PUBLIC_DOMAIN=localhost:3000

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Other optional services...
# See docs/guides/ENVIRONMENT_CONFIGURATION.md for complete list
```

## What Was Fixed

1. **Ghost API Configuration**: 
   - Added graceful handling for missing environment variables
   - All Ghost API functions now check if the client is properly configured
   - Added warning messages when configuration is missing

2. **Clipboard Permissions**:
   - Added `Permissions-Policy: clipboard-write=*` header to Next.js config
   - Improved error handling in clipboard hooks and components
   - Added permission checks before attempting to write to clipboard

## Next Steps

1. Create the `.env.local` file with your Ghost API credentials
2. Restart your development server
3. The errors should be resolved

If you don't have a Ghost blog, you can either:
- Set up a free Ghost blog at [ghost.org](https://ghost.org)
- Or comment out the Ghost-related components in your application
