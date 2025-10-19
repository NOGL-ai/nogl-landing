# Mapbox GL JS Setup Guide

This guide explains how to set up Mapbox GL JS for the interactive world map widget in the dashboard.

## Overview

The dashboard uses **Mapbox GL JS** for the "Winning Products Right Now" world map visualization, providing:
- ✅ Interactive zoom and pan
- ✅ Professional vector maps
- ✅ Custom styling to match Untitled UI
- ✅ Dark/light theme support
- ✅ Smooth 60fps animations

## Quick Setup

### 1. Get Mapbox Access Token

1. Visit [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account (no credit card required)
3. Navigate to **Access Tokens** page
4. Either:
   - Use the **default public token** already created
   - Click **Create a token** to generate a new one

**Token Format**: Starts with `pk.` (public token)

### 2. Configure Environment Variable

Create or update `.env.local` in the project root:

```bash
# Mapbox GL JS
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoie...your_token_here
```

**Important:**
- The variable MUST start with `NEXT_PUBLIC_` to be accessible in the browser
- Never commit `.env.local` to git (already in `.gitignore`)
- For production, add this to your hosting platform's environment variables

### 3. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

The map should now load successfully!

## Free Tier Limits

**Mapbox Free Tier:**
- ✅ 50,000 map loads per month
- ✅ All features included
- ✅ No credit card required

**What counts as a "map load"?**
- Each time a user loads the dashboard page
- Zooming/panning does NOT count
- Multiple users viewing simultaneously count as separate loads

**Estimated Usage:**
- 1,000 users × 10 dashboard views/month = 10,000 loads
- **Cost: $0/month** (well within free tier)

## Fallback Mode

If the Mapbox token is not configured or fails to load, the app automatically falls back to a **simple SVG map** with limited interactivity. This ensures the dashboard always works.

## Troubleshooting

### Map Not Loading?

**Check 1: Token Format**
```bash
# Correct ✅
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJja...

# Wrong ❌ (missing NEXT_PUBLIC_ prefix)
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoib...

# Wrong ❌ (not a public token - should start with pk.)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=sk.eyJ1Ijoib...
```

**Check 2: Environment Variable Loaded**

Open browser console and run:
```javascript
console.log(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)
```

Should show your token. If `undefined`, the token wasn't loaded.

**Check 3: Server Restarted**

Environment variables are only loaded when the server starts. Always restart after changing `.env.local`.

### Map Shows But Tiles Don't Load?

**Check:** Network tab in browser dev tools
- Look for requests to `api.mapbox.com`
- If you see **401 Unauthorized**: Token is invalid
- If you see **403 Forbidden**: Token doesn't have required permissions

**Fix:** Generate a new token with default settings.

### "Missing API Token" Error?

This means the environment variable isn't set. The app will automatically use the SVG fallback map.

## Advanced Configuration

### Custom Map Styles

The default styles are in `src/styles/mapbox-theme.ts`:
- **Light theme**: Uses CartoDB light tiles
- **Dark theme**: Uses CartoDB dark tiles

To use Mapbox Studio custom styles:

```typescript
// src/styles/mapbox-theme.ts
export const lightMapStyle = "mapbox://styles/your-username/your-style-id";
export const darkMapStyle = "mapbox://styles/your-username/your-dark-style-id";
```

### Production Deployment

**Vercel/Netlify:**
1. Go to project settings
2. Add environment variable:
   - Key: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
   - Value: Your token

**Docker:**
```bash
docker run -e NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token... your-image
```

**Environment-specific tokens:**
```bash
# .env.local (development)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.dev_token...

# Vercel (production)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.prod_token...
```

## Monitoring Usage

Track your Mapbox usage at:
[https://account.mapbox.com/statistics/](https://account.mapbox.com/statistics/)

**What to monitor:**
- Map loads per month
- Current tier (Free/Pay-as-you-go)
- Approaching limit warnings

## Cost Optimization

**Tips to stay within free tier:**

1. **Lazy Loading** ✅ (Already implemented)
   - Map only loads when visible
   - Uses `dynamic()` import

2. **Caching**
   - Browser caches map tiles automatically
   - Reduces repeat loads

3. **Analytics**
   - Monitor which pages have maps
   - Consider user-gated access for high-traffic pages

## Security Best Practices

### ✅ DO:
- Use public tokens (`pk.`) for client-side maps
- Set URL restrictions in Mapbox dashboard (optional)
- Rotate tokens periodically

### ❌ DON'T:
- Use secret tokens (`sk.`) in browser code
- Commit tokens to git
- Share tokens publicly

## Support

**Mapbox Documentation:**
- [GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/guides/)
- [Styling Guide](https://docs.mapbox.com/mapbox-gl-js/style-spec/)
- [Examples](https://docs.mapbox.com/mapbox-gl-js/example/)

**Internal Documentation:**
- [Design System Rules](../design-system/DESIGN_SYSTEM_RULES.md)
- [Environment Setup](./ENV_SETUP_GUIDE.md)
- [Feature Documentation](../features/README.md)

## Next Steps

Once configured, the map will:
1. Load automatically on the dashboard
2. Switch themes based on user preference
3. Show interactive markers for product locations
4. Display tooltips on hover
5. Allow zoom/pan exploration

**Enjoy your professional interactive map! 🗺️**

