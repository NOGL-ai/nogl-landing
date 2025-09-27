'use client';

import React, { useState } from 'react';
import { Sidebar, MobileSidebar } from './index';
import { useSidebar } from '@/hooks/useSidebar';
import { UserProfile } from '@/types/navigation';

interface SidebarLayoutProps {
  children: React.ReactNode;
  user?: UserProfile;
  onLogout?: () => void;
  className?: string;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  user,
  onLogout,
  className = '',
}) => {
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    openMobile,
    closeMobile,
  } = useSidebar();

  const [showSupportCard, setShowSupportCard] = useState(true);

  const handleDismissSupport = () => {
    setShowSupportCard(false);
  };

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          user={user}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onClose={closeMobile}
        user={user}
        onLogout={onLogout}
        showSupportCard={showSupportCard}
        onDismissSupport={handleDismissSupport}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600"
              onClick={openMobile}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-[30px] h-[30px]">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.7422 19.5789C19.2754 19.5789 19.9931 18.9436 23.9712 14.9676C26.514 12.4263 28.6876 10.3564 28.7901 10.3564C28.9132 10.3564 29.1182 10.4383 29.2412 10.5203C29.3848 10.6023 29.6104 11.1762 29.7539 11.791C29.8974 12.4058 30 13.8814 30 15.0701C30 16.4227 29.8769 17.7139 29.6514 18.5542C29.4668 19.292 28.8926 20.7266 28.4005 21.7308C27.7648 23.022 27.0881 24.0262 26.1039 25.0919C25.3246 25.9117 24.0943 26.9979 23.3561 27.4897C22.6384 27.9611 21.4695 28.5965 20.7928 28.8834C20.1161 29.1498 18.7833 29.5392 17.8195 29.7441C16.5686 29.9901 15.5843 30.0515 14.231 29.9696C13.2262 29.9081 11.8318 29.7031 11.1551 29.5392C10.4784 29.3547 9.14549 28.8219 8.20222 28.3505C7.17693 27.8177 5.94658 26.9774 5.14685 26.2396C4.40864 25.5633 3.46537 24.5796 3.03474 24.0467C2.48109 23.3704 2.23502 22.858 2.23502 22.4071C2.23502 21.8128 2.68614 21.2799 6.50024 17.4884C9.78118 14.1888 10.868 13.2256 11.2576 13.2256C11.6472 13.2461 12.5905 14.0454 14.9487 16.4022C17.6349 19.0665 18.2296 19.5584 18.7422 19.5789Z" fill="#375DFB"/>
                  <path d="M10.5605 0.643081C11.1142 0.458631 12.1395 0.233187 12.8162 0.130715C13.4929 0.00774801 14.8257 -0.0332346 15.7895 0.0282489C16.7533 0.0692378 18.0862 0.253698 18.7629 0.417653C19.4396 0.602104 20.5469 0.991487 21.2236 1.2989C21.9003 1.62682 22.9051 2.20067 23.4792 2.56957C24.0329 2.95897 24.8736 3.59429 25.3042 4.00418C25.7554 4.39358 26.5141 5.27484 27.0062 5.95116C27.4984 6.62747 27.9085 7.38578 27.888 7.63171C27.888 7.93913 27.3343 8.67693 26.3911 9.64017C25.5913 10.5009 24.7506 11.1772 24.5455 11.1772C24.3405 11.1772 23.8893 10.6854 23.4587 9.98857C23.0486 9.35325 22.4744 8.55396 22.1668 8.22605C21.8798 7.89814 21.08 7.2833 20.4033 6.83242C19.7267 6.40203 18.5783 5.84869 17.8401 5.62325C17.0404 5.37732 15.9331 5.23386 15.0718 5.23386C14.2721 5.23386 13.1648 5.35683 12.6111 5.52078C12.0369 5.66425 11.0937 6.03313 10.499 6.32005C9.92484 6.62747 9.00208 7.2628 8.46893 7.73418C7.95628 8.22605 7.23857 9.06633 6.86947 9.64017C6.52087 10.1935 6.04923 11.0748 5.86468 11.5871C5.65962 12.0995 5.41355 13.2882 5.14697 15.9935L3.34246 17.797C2.35818 18.7807 1.37389 19.58 1.16883 19.58C0.984282 19.58 0.738211 19.4161 0.635682 19.2111C0.533153 19.0267 0.3486 18.2683 0.225565 17.5305C0.102529 16.7927 0 15.6246 0 14.9073C0 14.2104 0.143541 12.9193 0.328094 12.038C0.512647 11.1773 0.881753 9.90659 1.16883 9.23027C1.45592 8.55396 2.07109 7.40627 2.56323 6.66847C3.03487 5.93066 4.08067 4.74198 4.85989 4.00418C5.70063 3.2049 6.95149 2.32365 7.91527 1.83178C8.79702 1.36041 9.98636 0.827532 10.5605 0.643081Z" fill="#00C8F4"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">NOGL</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
