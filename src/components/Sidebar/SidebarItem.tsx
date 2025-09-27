'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { NavigationItem } from '@/types/navigation';

interface SidebarItemProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, isCollapsed }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const baseClasses = clsx(
    'flex items-center gap-2 px-3 py-2 rounded-[5px] transition-all duration-200 relative',
    'font-inter text-[14px] font-medium leading-5 tracking-[-0.084px]',
    isActive
      ? 'bg-[#375DFB] text-white'
      : 'text-[#9293A9] hover:bg-[#375DFB]/10 hover:text-[#375DFB]'
  );

  const iconClasses = clsx(
    'w-5 h-5 flex-shrink-0',
    isActive ? 'text-white' : 'text-[#9293A9]'
  );

  return (
    <div className="relative">
      <Link
        href={item.path}
        className={baseClasses}
        onMouseEnter={() => isCollapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Icon */}
        <div className={iconClasses}>
          {item.icon}
        </div>

        {/* Title (only visible when expanded) */}
        {!isCollapsed && (
          <span className="flex-1">
            {item.title}
          </span>
        )}

        {/* Badge (only visible when expanded and badge exists) */}
        {!isCollapsed && item.badge && (
          <div className={clsx(
            'px-1.5 py-0.5 rounded text-[12px] font-medium leading-3',
            item.badge.variant === 'new' && 'bg-[#DF1C41] text-white',
            item.badge.variant === 'soon' && isActive
              ? 'bg-white/10 text-white'
              : 'bg-[#375DFB]/10 text-[#375DFB]',
            item.badge.variant === 'default' && 'bg-gray-100 text-gray-700'
          )}>
            {item.badge.text}
          </div>
        )}
      </Link>

      {/* Tooltip for collapsed state */}
      {isCollapsed && showTooltip && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50">
          <div className="bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap shadow-lg">
            {item.title}
            {item.badge && (
              <span className={clsx(
                'ml-2 px-1.5 py-0.5 rounded text-xs',
                item.badge.variant === 'new' && 'bg-red-500 text-white',
                item.badge.variant === 'soon' && 'bg-blue-500 text-white',
                item.badge.variant === 'default' && 'bg-gray-500 text-white'
              )}>
                {item.badge.text}
              </span>
            )}
            {/* Tooltip arrow */}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        </div>
      )}

      {/* Active indicator (blue line on the right) */}
      {isActive && (
        <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#375DFB] rounded-l-[4px]" />
      )}
    </div>
  );
};

export default SidebarItem;
