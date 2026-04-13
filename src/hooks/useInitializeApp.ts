'use client';

import { useEffect } from 'react';

/**
 * Initialize app on first client load
 * Performs database health checks and other setup
 */
export function useInitializeApp() {
  useEffect(() => {
    let mounted = true;

    async function initializeApp() {
      try {
        // Call database initialization endpoint
        const response = await fetch('/api/health/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          console.warn('App initialization warning:', response.statusText);
        }
      } catch (error) {
        // Non-fatal error - app can still function
        console.warn(
          'App initialization incomplete:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    if (mounted) {
      // Initialize on first load
      initializeApp();
    }

    return () => {
      mounted = false;
    };
  }, []);
}
