"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useLoading } from '@/context/LoadingContext';
import type { LottieRefCurrentProps } from 'lottie-react';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white dark:bg-neutral-900" />
});

const LoadingScreen = () => {
  const { isLoading } = useLoading();
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      // Initial check
      setIsMobile(window.innerWidth <= 768);

      // Add resize listener
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1.0);
    }
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] w-full h-full bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {typeof window !== 'undefined' && (
          <Lottie
            lottieRef={lottieRef}
            animationData={require(`/public/animations/${isMobile ? 'loading-mobile' : 'loading'}.json`)}
            loop={false}
            autoplay={true}
            className="w-full h-full"
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
              progressiveLoad: true,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
