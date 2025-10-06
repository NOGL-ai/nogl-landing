"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { UserProfile } from "@/types/navigation";
import { SimpleAccountCard } from "./simple-account-card";

interface SidebarFooterProps {
  user?: UserProfile;
  onLogout?: () => void | Promise<void>;
  isCollapsed?: boolean;
  isHovered?: boolean;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  badge?: string;
  onClick?: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  user,
  onLogout,
  isCollapsed = false,
  isHovered = false,
  className = "",
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFeaturedCardVisible, setIsFeaturedCardVisible] = useState(true);
  const [usedSpacePercentage, setUsedSpacePercentage] = useState(80);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use next-themes directly
  const currentTheme = useMemo(() => {
    if (!mounted) return "light";
    return theme || "light";
  }, [theme, mounted]);

  // Navigation items
  // const navigationItems: NavigationItem[] = [
  //   {
  //     id: 'support',
  //     label: 'Support',
  //     icon: (
  //       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
  //         <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  //       </svg>
  //     ),
  //     badge: 'Online',
  //     onClick: () => router.push('/' as any),
  //   },
  //   {
  //     id: 'open-browser',
  //     label: 'Open in browser',
  //     icon: (
  //       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
  //         <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  //       </svg>
  //     ),
  //     onClick: () => router.push('/' as any),
  //   },
  // ];


  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  const dismissFeaturedCard = () => {
    setIsFeaturedCardVisible(false);
  };

  const upgradePlan = () => {
    // Placeholder for upgrade functionality
    // TODO: Implement upgrade functionality
  };

  const showContent = !isCollapsed || isHovered;

  return (
    <div className={`flex flex-col gap-4 px-4 py-4 ${className}`}>
      {/* Navigation Items */}
      {/* {showContent ? (
        <div className="flex flex-col gap-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 group ${
                currentTheme === 'dark' 
                  ? "bg-[#0a0d12] hover:bg-[#252b37]" 
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className={`transition-colors ${
                currentTheme === 'dark' 
                  ? "text-[#717680] group-hover:text-[#a4a7ae]" 
                  : "text-[#a4a7ae] group-hover:text-[#717680]"
              }`}>
                {item.icon}
              </div>
              <span className={`font-semibold text-base flex-1 text-left ${
                currentTheme === 'dark' 
                  ? "text-[#d5d7da]" 
                  : "text-[#717680]"
              }`}>
                {item.label}
              </span>
              {item.badge && (
                <div className={`border rounded-md px-2 py-1 flex items-center gap-1 ${
                  currentTheme === 'dark' 
                    ? "bg-[#181d27] border-[#414651]" 
                    : "bg-gray-100 border-gray-200"
                }`}>
                  <div className="w-2 h-2 bg-[#17b26a] rounded-full"></div>
                  <span className={`text-xs font-medium ${
                    currentTheme === 'dark' 
                      ? "text-[#d5d7ae]" 
                      : "text-[#717680]"
                  }`}>Online</span>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`p-2 rounded-md transition-colors duration-200 group relative ${
                currentTheme === 'dark' 
                  ? "bg-[#0a0d12] hover:bg-[#252b37]" 
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
              title={item.label}
            >
              <div className={`transition-colors ${
                currentTheme === 'dark' 
                  ? "text-[#717680] group-hover:text-[#a4a7ae]" 
                  : "text-[#a4a7ae] group-hover:text-[#717680]"
              }`}>
                {item.icon}
              </div>
              {item.badge && (
                <div className={`absolute -top-1 -right-1 w-3 h-3 bg-[#17b26a] rounded-full border ${
                  currentTheme === 'dark' 
                    ? "border-[#0a0d12]" 
                    : "border-gray-50"
                }`}></div>
              )}
            </button>
          ))}
        </div>
      )} */}

      {/* Featured Card - Used Space */}
      {/* {showContent && isFeaturedCardVisible && (
        <div className="bg-[#181d27] border border-[#252b37] rounded-xl p-4 relative">
          <button
            onClick={dismissFeaturedCard}
            className="absolute top-2 right-2 p-2 rounded-lg hover:bg-[#252b37] transition-colors"
          >
            <svg className="w-5 h-5 text-white opacity-70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm mb-1">Used space</h3>
            <p className="text-[#a4a7ae] text-sm">
              Your team has used {usedSpacePercentage}% of your available space. Need more?
            </p>
          </div>

          <div className="mb-4">
            <div className="w-full bg-[#414651] rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${usedSpacePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={dismissFeaturedCard}
              className="text-[#a4a7ae] font-semibold text-sm hover:text-white transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={upgradePlan}
              className="text-[#d5d7ae] font-semibold text-sm hover:text-white transition-colors"
            >
              Upgrade plan
            </button>
          </div>
        </div>
      )} */}

          {/* Simple Account Card */}
          <SimpleAccountCard 
            user={user}
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
            isHovered={isHovered}
            theme={currentTheme}
          />
    </div>
  );
};
