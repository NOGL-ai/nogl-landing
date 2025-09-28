'use client';

import React, { useState } from 'react';
import { 
  FullscreenIcon, 
  CustomizeIcon, 
  PaintBucketIcon 
} from './DashboardIcons';

interface DashboardPageHeaderProps {
  title?: string;
  onColorToggle?: () => void;
  onFullscreenToggle?: () => void;
  onEditWidgets?: () => void;
  className?: string;
}

export const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
  title = 'Dashboard',
  onColorToggle,
  onFullscreenToggle,
  onEditWidgets,
  className = '',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (onFullscreenToggle) {
      onFullscreenToggle();
    }
    
    // Native fullscreen API
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={`flex flex-col justify-center items-start gap-6 w-full min-h-14 ${className}`}>
      <div className="flex flex-col sm:flex-row p-3 sm:items-center gap-3 self-stretch rounded-xl border border-[#F2F2F2] bg-white dark:bg-gray-800 dark:border-gray-700 relative">
        <div className="flex items-start gap-1.5 flex-1 relative">
          <div className="flex flex-col items-start gap-1 flex-1 relative">
            <h1 className="self-stretch text-[#14151A] dark:text-white font-inter text-xl sm:text-2xl font-semibold leading-7 sm:leading-8 tracking-[-0.336px] relative">
              {title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-[5px] relative">
          {/* Color Button */}
          <div className="hidden sm:flex items-center gap-[4.375px] relative">
            <div className="flex w-3.5 h-3.5 justify-center items-center relative">
              <div className="flex w-4 h-4 justify-center items-center flex-shrink-0 absolute left-[-1px] top-[-1px]">
                <PaintBucketIcon />
              </div>
            </div>
            <button
              onClick={onColorToggle}
              className="text-[#14151A] dark:text-white text-center font-inter text-sm font-medium leading-5 tracking-[-0.07px] hover:opacity-70 transition-opacity"
            >
              Color
            </button>
          </div>

          {/* Actions Container */}
          <div className="flex items-start gap-2 relative">
            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreenToggle}
              className="flex p-2 px-2.5 justify-center items-center gap-0.5 rounded-[5px] bg-[rgba(10,15,41,0.04)] dark:bg-gray-700 hover:bg-[rgba(10,15,41,0.08)] dark:hover:bg-gray-600 transition-colors"
              title="Toggle Fullscreen"
            >
              <FullscreenIcon />
            </button>

            {/* Edit Widgets Button */}
            <button
              onClick={onEditWidgets}
              className="flex w-auto sm:w-[131px] h-8 p-1.5 px-2.5 justify-center items-center gap-0.5 rounded-[5px] border border-[#E2E4E9] dark:border-gray-600 bg-white dark:bg-gray-700 shadow-[0_1px_2px_0_rgba(20,21,26,0.05)] hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex w-4 h-4 p-[1.333px] justify-center items-center flex-shrink-0 relative">
                <div className="flex w-[13px] h-[13px] justify-center items-center flex-shrink-0 absolute left-[1px] top-[1px]">
                  <CustomizeIcon />
                </div>
              </div>
              <div className="hidden sm:flex p-0 px-1 justify-center items-center gap-0 relative">
                <span className="text-[#14151A] dark:text-white text-center font-inter text-sm font-medium leading-5 tracking-[-0.07px]">
                  Edit Widgets
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageHeader;
