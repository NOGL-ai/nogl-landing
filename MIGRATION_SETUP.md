# Database Migration & Setup Guide

## What Was Fixed

The preview was failing to load due to **database schema synchronization issues**. The following fixes have been implemented:

### 1. ✅ Safe Build Process
- Modified build script to use `scripts/prisma-generate-safe.js`
- Prevents timeouts during `prisma generate` if database is unreachable
- Build will continue even if Prisma client generation takes too long

### 2. ✅ Graceful Database Handling
- Added `src/lib/initializeDatabase.ts` - Safely checks database schema
- Added `src/app/api/health/init/route.ts` - App initialization endpoint
- App won't crash if database is unavailable; features degrade gracefully

### 3. ✅ Migration File Ready
- Created `prisma/migrations/0_sync_schema/migration.sql`
- Contains full schema definition for both `nogl` and `public` schemas
- Ready to apply to your PostgreSQL database

## Next Steps (You Must Do These)

### Option A: Recommended - Apply Migration via Prisma CLI

From the `nogl-landing` directory, run:

```bash
npx prisma migrate deploy
```

This will:
1. Connect to your PostgreSQL database at `10.10.10.213:5432` (via Tailscale)
2. Apply the migration from `prisma/migrations/0_sync_schema/migration.sql`
3. Track the migration state
4. Generate the Prisma client

Then start the dev server:

```bash
npm run dev
```

### Option B: Apply Migration Manually (If Option A Fails)

1. **Connect to your PostgreSQL database** (via Tailscale CLI):
   ```bash
   psql -h 10.10.10.213 -U postgres -d nogl_landing
   ```

2. **Copy and run the SQL** from:
   ```
   nogl-landing/prisma/migrations/0_sync_schema/migration.sql
   ```

3. **Generate Prisma client**:
   ```bash
   cd nogl-landing
   npx prisma generate
   ```

4. **Start dev server**:
   ```bash
   npm run dev
   ```

### Option C: Quick Test (If Database Unavailable)

If you need to test the app immediately without applying migrations:

```bash
cd nogl-landing
npm run dev
```

The app will:
- Start normally (build won't timeout)
- Initialize with degraded database functionality
- Show warnings in the console about missing schema
- Features that require the database will fail gracefully
- You can still apply migrations later

## File Changes Made

### Created Files:
- `scripts/prisma-generate-safe.js` - Safe Prisma wrapper
- `scripts/apply-migration.js` - Migration helper script
- `src/lib/initializeDatabase.ts` - Database init handler
- `src/hooks/useInitializeApp.ts` - App init hook
- `src/app/api/health/init/route.ts` - Health check endpoint
- `prisma/migrations/0_sync_schema/migration.sql` - Schema migration

### Modified Files:
- `package.json` - Updated build script to use safe wrapper
- `src/app/ClientLayout.tsx` - Added initialization hook

## Troubleshooting

### Build Still Times Out
- Check database connectivity: `psql -h 10.10.10.213 -U postgres -d nogl_landing`
- Verify Tailscale connection is active
- Check firewall rules allow port 5432

### Prisma Client Missing
- Run: `npx prisma generate`
- Rebuild: `npm run build`

### Database Connection Errors
- Verify `DATABASE_URL` and `DIRECT_URL` in `.env` are correct
- Ensure PostgreSQL is running: `systemctl status postgresql`
- Check Tailscale IP: `tailscale ip -4`

### Features Not Working After Migration
- Clear cache: `rm -rf .next`
- Rebuild: `npm run build`
- Restart: `npm run dev`

## Verification

After applying migrations, verify setup:

```bash
# Check health endpoint
curl http://localhost:3000/api/health/init

# Expected response:
# {
#   "status": "ok",
#   "databaseReady": true,
#   "timestamp": "2024-..."
# }
```

## Questions?

- Check the logs during `npm run dev`
- Verify `.env` has correct database credentials
- Ensure Tailscale is connected to the network
- Run migrations with verbose output: `npx prisma migrate deploy --verbose`
