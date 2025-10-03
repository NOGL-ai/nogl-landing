"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    return (
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            className={cn(
              "w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          />
        </div>
        <div className="text-sm">
          {label && (
            <label className="font-medium text-gray-900 dark:text-gray-100">
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {error && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
