"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', showIcon = true, dismissible = false, onDismiss, children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-50 text-gray-900 border-gray-200',
      success: 'bg-green-50 text-green-800 border-green-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      error: 'bg-red-50 text-red-800 border-red-200',
      info: 'bg-blue-50 text-blue-800 border-blue-200',
    };

    const icons = {
      default: InformationCircleIcon,
      success: CheckCircleIcon,
      warning: ExclamationTriangleIcon,
      error: XCircleIcon,
      info: InformationCircleIcon,
    };

    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-start gap-3 rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        {showIcon && (
          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          {children}
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };
