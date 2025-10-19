"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedSubscribeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const AnimatedSubscribeButton = React.forwardRef<HTMLButtonElement, AnimatedSubscribeButtonProps>(
  ({ className, children, variant = 'default', size = 'md', isLoading = false, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-brand-solid text-white hover:bg-brand-solid_hover focus-visible:ring-brand hover:scale-105 hover:shadow-lg',
      primary: 'bg-brand text-white hover:bg-brand-solid_hover focus-visible:ring-brand hover:scale-105 hover:shadow-lg',
      secondary: 'bg-background text-secondary ring-1 ring-border hover:bg-primary_hover focus-visible:ring-brand hover:scale-105 hover:shadow-lg',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);

AnimatedSubscribeButton.displayName = "AnimatedSubscribeButton";

export { AnimatedSubscribeButton };
