# Environment Variables

## Database Configuration

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
DIRECT_URL="postgresql://username:password@localhost:5432/database_name"
```

## Competitor API Feature Flags

```env
# Enable/disable competitor API functionality
ENABLE_COMPETITOR_API=true

# Enable/disable competitor write operations (create, update, delete)
ENABLE_COMPETITOR_WRITE=true

# Automatically seed competitor data on application start
COMPETITOR_SEED_ON_START=false
```

## Environment-Specific Configurations

### Development (.env.local)
```env
NODE_ENV=development
ENABLE_COMPETITOR_API=true
COMPETITOR_SEED_ON_START=false
```

### Staging (.env.staging)
```env
NODE_ENV=staging
ENABLE_COMPETITOR_API=true
COMPETITOR_SEED_ON_START=true
```

### Production (.env.production)
```env
NODE_ENV=production
ENABLE_COMPETITOR_API=true
COMPETITOR_SEED_ON_START=false
```

## Usage

1. Copy the relevant environment variables to your `.env.local` file
2. Update the database URLs with your actual database credentials
3. Set feature flags according to your environment needs
4. Restart your development server after making changes
