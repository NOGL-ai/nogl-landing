// ClientLayout.tsx
'use client';

import React from 'react';
import { LoadingProvider } from '@/context/LoadingContext';
import LoadingScreen from '@/components/Common/LoadingScreen';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <LoadingProvider>
      <LoadingScreen />
      {children}
    </LoadingProvider>
  );
};

export default ClientLayout;
