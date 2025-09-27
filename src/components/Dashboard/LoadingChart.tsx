'use client';

import React from 'react';

interface LoadingChartProps {
  title: string;
  height?: string;
  className?: string;
}

export const LoadingChart: React.FC<LoadingChartProps> = ({
  title,
  height = '442px',
  className = '',
}) => {
  const ErrorIcon = () => (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 33.25C11.1297 33.25 4.75 26.8703 4.75 19C4.75 11.1297 11.1297 4.75 19 4.75C26.8703 4.75 33.25 11.1297 33.25 19C33.25 26.8703 26.8703 33.25 19 33.25ZM17.575 23.275V26.125H20.425V23.275H17.575ZM17.575 11.875V20.425H20.425V11.875H17.575Z" fill="#0A0D14"/>
    </svg>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-[#E2E4E9] dark:border-gray-700 p-5 relative overflow-hidden ${className}`} style={{ height }}>
      {/* Title */}
      <div className="mb-5">
        <h3
          className="text-[#111827] dark:text-white font-medium text-base leading-6"
          style={{
            fontFamily: 'Inter',
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '-0.176px'
          }}
        >
          {title}
        </h3>
      </div>

      {/* Loading Overlay - positioned to cover the bottom part */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-white dark:bg-gray-800 bg-opacity-30 dark:bg-opacity-50 backdrop-blur-[10px] rounded-b-[11px] flex flex-col items-center justify-center"
        style={{
          height: 'calc(100% - 80px)' // Leave space for title
        }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <ErrorIcon />
          <h4
            className="text-[#111827] dark:text-white font-semibold text-base leading-[18px] mt-8 mb-4 max-w-[234px]"
            style={{
              fontFamily: 'Inter',
              fontSize: '16px',
              lineHeight: '18px'
            }}
          >
            Missing data from input feed
          </h4>
          <p
            className="text-[#646978] dark:text-gray-400 font-normal text-sm leading-5 max-w-[280px]"
            style={{
              fontFamily: 'Inter',
              fontSize: '14px',
              lineHeight: '20px'
            }}
          >
            We need sales price to calculate price status. Provide sales price in your input feeds to see statistics
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingChart;
