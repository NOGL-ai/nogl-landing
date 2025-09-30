/**
 * UNUSED FILE - PROVIDER COMPONENT
 * 
 * This is a React Query provider wrapper that was created to support the
 * infinite scroll table functionality. However, it's not currently being used
 * in the main application.
 * 
 * The main application likely already has its own query client setup,
 * so this provider is redundant and unused.
 * 
 * If you want to use the infinite scroll table components, you would need to:
 * 1. Either use this provider or integrate with existing query client
 * 2. Import and use it in your app layout
 * 
 * Created: [Date when this was added]
 * Status: Unused - main app has its own query client setup
 */

'use client';

import React from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface QueryClientProviderProps {
  children: React.ReactNode;
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}
