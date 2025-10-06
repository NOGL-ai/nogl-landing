"use client";

import React, { useEffect, useRef } from 'react';

type Props = {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  ariaLabel?: string;
  id?: string;
  className?: string;
};

export default function Checkbox({ checked = false, indeterminate = false, onChange, ariaLabel, id, className = '' }: Props) {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <label className={`inline-flex items-center ${className}` }>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        aria-label={ariaLabel}
        className="sr-only peer"
      />

      <span
        aria-hidden="true"
        className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7F56D9]/40 ${
          checked ? 'bg-[#7F56D9] border-[#7F56D9]' : 'bg-transparent border-[#D5D7DA]'
        }`}
      >
        {/* Checked */}
        {checked && !indeterminate && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M11.6673 3.5L5.25065 9.91667L2.33398 7" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        {/* Indeterminate */}
        {indeterminate && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M2.91602 7H11.0827" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </label>
  );
}
