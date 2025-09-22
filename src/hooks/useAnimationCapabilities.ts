"use client";

import { useState, useEffect } from 'react';

interface AnimationCapabilities {
  hasGPU: boolean;
  hasReducedMotion: boolean;
  isLowEndDevice: boolean;
  animationLevel: 'none' | 'minimal' | 'reduced' | 'full';
}

export function useAnimationCapabilities(): AnimationCapabilities {
  const [capabilities, setCapabilities] = useState<AnimationCapabilities>({
    hasGPU: true, // Default to true for SSR
    hasReducedMotion: false,
    isLowEndDevice: false,
    animationLevel: 'full'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for reduced motion preference
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect GPU support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasGPU = !!gl;

    // Detect low-end device characteristics
    const isLowEndDevice = 
      // Low memory
      (navigator as any).deviceMemory < 4 ||
      // Slow connection
      (navigator as any).connection?.effectiveType === 'slow-2g' ||
      (navigator as any).connection?.effectiveType === '2g' ||
      // Low core count (approximate)
      navigator.hardwareConcurrency <= 2 ||
      // Mobile device with likely limited resources
      (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
       window.screen.width <= 480);

    // Determine animation level
    let animationLevel: 'none' | 'minimal' | 'reduced' | 'full' = 'full';
    
    if (hasReducedMotion) {
      animationLevel = 'none';
    } else if (isLowEndDevice && !hasGPU) {
      animationLevel = 'minimal';
    } else if (isLowEndDevice || !hasGPU) {
      animationLevel = 'reduced';
    }

    setCapabilities({
      hasGPU,
      hasReducedMotion,
      isLowEndDevice,
      animationLevel
    });

    // Cleanup canvas
    canvas.remove();
  }, []);

  return capabilities;
}

// Export animation variants for different capability levels
export const getAnimationVariants = (level: 'none' | 'minimal' | 'reduced' | 'full') => {
  switch (level) {
    case 'none':
      return {
        // No animations - immediate state changes
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
        transition: { duration: 0 }
      };
    
    case 'minimal':
      return {
        // Simple opacity only
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        transition: { duration: 0.2, ease: "linear" }
      };
    
    case 'reduced':
      return {
        // Opacity + minimal transform
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: "easeOut" }
      };
    
    case 'full':
    default:
      return {
        // Full animations with scale, transforms, etc.
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.4, ease: "easeOut" }
      };
  }
};

// Export stagger timing for different levels
export const getStaggerTiming = (level: 'none' | 'minimal' | 'reduced' | 'full') => {
  switch (level) {
    case 'none':
      return { staggerChildren: 0, delayChildren: 0 };
    case 'minimal':
      return { staggerChildren: 0.05, delayChildren: 0 };
    case 'reduced':
      return { staggerChildren: 0.08, delayChildren: 0.05 };
    case 'full':
    default:
      return { staggerChildren: 0.1, delayChildren: 0.1 };
  }
};
