/**
 * Feature flags for environment-specific configuration
 * Allows safe deployment and rollback of features
 */
export const FEATURES = {
  COMPETITOR_API: process.env.ENABLE_COMPETITOR_API === 'true',
  COMPETITOR_WRITE: process.env.ENABLE_COMPETITOR_WRITE !== 'false', // default true
  COMPETITOR_SEED_ON_START: process.env.COMPETITOR_SEED_ON_START === 'true',
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}

/**
 * Get all enabled features (for debugging)
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURES)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
}
