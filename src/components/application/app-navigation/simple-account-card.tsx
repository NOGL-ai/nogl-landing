"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserProfile } from "@/types/navigation";

interface SimpleAccountCardProps {
  user?: UserProfile;
  onLogout?: () => void;
  isCollapsed?: boolean;
  isHovered?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
  hideAvatar?: boolean;
  alwaysShowDropdown?: boolean;
  externalDropdownState?: boolean;
  setExternalDropdownState?: (open: boolean) => void;
}

export const SimpleAccountCard: React.FC<SimpleAccountCardProps> = ({
  user,
  onLogout,
  isCollapsed = false,
  isHovered = false,
  className = "",
  theme = 'light',
  hideAvatar = false,
  alwaysShowDropdown = false,
  externalDropdownState,
  setExternalDropdownState,
}) => {
  const [internalIsMenuOpen, setInternalIsMenuOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isMenuOpen = externalDropdownState !== undefined ? externalDropdownState : internalIsMenuOpen;
  const setIsMenuOpen = setExternalDropdownState || setInternalIsMenuOpen;
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showContent = !isCollapsed || isHovered;

  const toggleMenu = () => {
    if (setExternalDropdownState) {
      setExternalDropdownState(!isMenuOpen);
    } else {
      setInternalIsMenuOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsMenuOpen(false);
  };

  // Theme-based styling
  const isDark = theme === 'dark';
  
  const cardStyles = isDark 
    ? 'bg-[#181d27] border-[#252b37] hover:bg-[#252b37]'
    : 'bg-white border-[#e9eaeb] hover:bg-gray-50';
    
  const textStyles = {
    name: isDark ? 'text-neutral-50' : 'text-[#181d27]',
    email: isDark ? 'text-[#a4a7ae]' : 'text-[#535862]',
    menuItem: isDark ? 'text-[#d5d7da]' : 'text-[#414651]',
    shortcut: isDark ? 'text-[#a4a7ae]' : 'text-[#535862]',
    sectionHeader: isDark ? 'text-[#a4a7ae]' : 'text-[#535862]',
  };
  
  const buttonStyles = isDark 
    ? 'bg-[#252b37]'
    : 'bg-neutral-50';
    
  const menuStyles = {
    outer: isDark ? 'bg-[#252b37] border-[#252b37]' : 'bg-neutral-50 border-[rgba(0,0,0,0.08)]',
    inner: isDark ? 'bg-[#0a0d12]' : 'bg-white border-[#e9eaeb]',
    divider: isDark ? 'border-[#252b37]' : 'border-[#e9eaeb]',
    shortcut: isDark ? 'border-[#414651]' : 'border-[#e9eaeb]',
    switchAccount: isDark ? 'bg-[#252b37]' : 'bg-neutral-50',
    addAccount: isDark ? 'bg-[#181d27] border-[#414651]' : 'bg-white border-[#d5d7da]',
  };
  
  const onlineIndicatorBorder = isDark ? 'border-[#0a0d12]' : 'border-white';

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Account Card - Theme-aware styling */}
      <div
        className={`${cardStyles} border border-solid box-border content-stretch flex gap-[16px] items-start p-[12px] relative rounded-[12px] size-full transition-colors ${
          showContent ? '' : 'justify-center'
        }`}
        data-name={`Type=Card, Open=True, Theme=${theme === 'dark' ? 'Dark' : 'Default'}, Breakpoint=Desktop`}
      >
        {/* Avatar and User Info Group */}
        <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0 pr-12" data-name="Avatar label group">
          {/* Avatar - conditionally rendered */}
          {!hideAvatar && (
            <div className="border border-[rgba(0,0,0,0.08)] border-solid relative rounded-[200px] shrink-0 size-[40px]" data-name="Avatar">
              {user?.avatar ? (
                <img 
                  alt={user.name || 'User'} 
                  className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[200px] size-full" 
                  src={user.avatar} 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[200px] flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div className={`absolute bg-[#17b26a] border-[1.5px] border-solid ${onlineIndicatorBorder} bottom-0 right-0 rounded-[5px] size-[10px]`} data-name="_Avatar online indicator" />
            </div>
          )}
          
          {/* User Info */}
          {(showContent || alwaysShowDropdown) && (
            <div className="content-stretch flex flex-col items-start leading-[20px] not-italic relative shrink-0 text-[14px] min-w-0" data-name="Text and supporting text">
              <p className={`font-['Inter:Semi_Bold',_sans-serif] font-semibold relative shrink-0 truncate ${textStyles.name}`}>
                {user?.name || 'User'}
              </p>
              <p className={`font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 truncate ${textStyles.email}`}>
                {user?.email || 'No email'}
              </p>
            </div>
          )}
        </div>

        {/* Dropdown Button */}
        {(showContent || alwaysShowDropdown) && (
          <div
            className="absolute content-stretch flex items-start right-[4px] top-[4px] z-10"
            data-name="__Nav account card menu button"
          >
            <button
              type="button"
              className={`${buttonStyles} box-border content-stretch flex items-center justify-center p-[6px] relative rounded-[8px] shrink-0`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={(event) => {
                event.stopPropagation();
                toggleMenu();
              }}
            >
              <span className="sr-only">{isMenuOpen ? 'Close account menu' : 'Open account menu'}</span>
              <div className="overflow-clip relative shrink-0 size-[16px]" data-name="chevron-selector-vertical">
                <div className="absolute inset-[16.67%_29.17%]" data-name="Icon">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="rgba(113, 118, 128, 1)">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Dropdown Menu - Theme-aware styling */}
      {isMenuOpen && (showContent || alwaysShowDropdown) && (
        <div
          className={`absolute ${menuStyles.outer} border border-solid bottom-full left-0 mb-2 rounded-[12px] w-[264px] z-[100]`}
          data-name="Menu"
          role="menu"
          aria-label="Account menu"
        >
          <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-[264px]">
            <div className={`${menuStyles.inner} ${isDark ? '' : 'border border-solid'} content-stretch flex flex-col items-start relative rounded-bl-[16px] rounded-br-[16px] rounded-tl-[12px] rounded-tr-[12px] shrink-0 w-full`} data-name="Menu items wrapper">
              {/* Main Menu Items */}
              <div className="box-border content-stretch flex flex-col gap-[2px] items-start overflow-clip px-0 py-[6px] relative shrink-0 w-full" data-name="Menu items">
                {/* View Profile */}
                <div className="box-border content-stretch flex items-center px-[6px] py-0 relative shrink-0 w-full" data-name="_Nav account card menu item">
                  <div className="box-border content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px overflow-clip p-[8px] relative rounded-[6px] shrink-0" data-name="Content">
                    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" data-name="Icon and text">
                      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="user-01">
                        <div className="absolute inset-[12.5%_16.67%]" data-name="Icon">
                          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="rgba(164, 167, 174, 1)">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                      </div>
                      <p className={`flex-[1_0_0] font-['Inter:Semi_Bold',_sans-serif] font-semibold h-[20px] leading-[20px] min-h-px min-w-px not-italic relative shrink-0 ${textStyles.menuItem} text-[14px] whitespace-pre-wrap`}>
                        View profile
                      </p>
                    </div>
                    <div className={`border ${menuStyles.shortcut} border-solid box-border content-stretch flex items-start px-[4px] py-px relative rounded-[4px] shrink-0`} data-name="Shortcut wrapper">
                      <p className={`font-['Inter:Medium',_sans-serif] font-medium leading-[18px] not-italic relative shrink-0 ${textStyles.shortcut} text-[12px]`}>{`⌘K->P`}</p>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="box-border content-stretch flex items-center px-[6px] py-0 relative shrink-0 w-full" data-name="_Nav account card menu item">
                  <div className="box-border content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px overflow-clip p-[8px] relative rounded-[6px] shrink-0" data-name="Content">
                    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" data-name="Icon and text">
                      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="settings-01">
                        <div className="absolute inset-[8.333%]" data-name="Icon">
                          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="rgba(164, 167, 174, 1)">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.992l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className={`flex-[1_0_0] font-['Inter:Semi_Bold',_sans-serif] font-semibold h-[20px] leading-[20px] min-h-px min-w-px not-italic relative shrink-0 ${textStyles.menuItem} text-[14px] whitespace-pre-wrap`}>
                        Account settings
                      </p>
                    </div>
                    <div className={`border ${menuStyles.shortcut} border-solid box-border content-stretch flex items-start px-[4px] py-px relative rounded-[4px] shrink-0`} data-name="Shortcut wrapper">
                      <p className={`font-['Inter:Medium',_sans-serif] font-medium leading-[18px] not-italic relative shrink-0 ${textStyles.shortcut} text-[12px]`}>
                        ⌘S
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documentation */}
                <div className="box-border content-stretch flex items-center px-[6px] py-0 relative shrink-0 w-full" data-name="_Nav account card menu item">
                  <div className="box-border content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px overflow-clip p-[8px] relative rounded-[6px] shrink-0" data-name="Content">
                    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" data-name="Icon and text">
                      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="book-open-01">
                        <div className="absolute inset-[12.5%_8.33%]" data-name="Icon">
                          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="rgba(164, 167, 174, 1)">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                        </div>
                      </div>
                      <p className={`flex-[1_0_0] font-['Inter:Semi_Bold',_sans-serif] font-semibold h-[20px] leading-[20px] min-h-px min-w-px not-italic relative shrink-0 ${textStyles.menuItem} text-[14px] whitespace-pre-wrap`}>
                        Documentation
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className={`${menuStyles.divider} border-b-0 border-l-0 border-r-0 border-solid border-t relative shrink-0 w-full`} data-name="Menu items">
                <div className="box-border content-stretch flex flex-col gap-[2px] items-start overflow-clip px-0 py-[6px] relative rounded-[inherit] w-full">
                  {/* Switch Account Section */}
                  <div className="box-border content-stretch flex items-start pb-[4px] pt-[6px] px-[12px] relative shrink-0 w-full" data-name="Text wrapper">
                    <p className={`flex-[1_0_0] font-['Inter:Semi_Bold',_sans-serif] font-semibold h-[18px] leading-[18px] min-h-px min-w-px not-italic relative shrink-0 ${textStyles.sectionHeader} text-[12px] whitespace-pre-wrap`}>
                      Switch account
                    </p>
                  </div>
                  
                  {/* Current User */}
                  <div className="box-border content-stretch flex items-center px-[6px] py-0 relative shrink-0 w-full" data-name="_Nav account card menu item">
                    <div className={`${menuStyles.switchAccount} box-border content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px overflow-clip px-[8px] py-[6px] relative rounded-[6px] shrink-0`} data-name="Content">
                      <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" data-name="Avatar label group">
                        <div className="border border-[rgba(0,0,0,0.08)] border-solid relative rounded-[200px] shrink-0 size-[40px]" data-name="Avatar">
                          {user?.avatar ? (
                            <img alt={user.name || 'User'} className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[200px] size-full" src={user.avatar} />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[200px] flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className={`absolute bg-[#17b26a] border-[1.5px] border-solid ${onlineIndicatorBorder} bottom-0 right-0 rounded-[5px] size-[10px]`} data-name="_Avatar online indicator" />
                        </div>
                        <div className="content-stretch flex flex-col items-start leading-[20px] not-italic relative shrink-0 text-[14px]" data-name="Text and supporting text">
                          <p className={`font-['Inter:Semi_Bold',_sans-serif] font-semibold relative shrink-0 ${textStyles.name}`}>
                            {user?.name || 'User'}
                          </p>
                          <p className={`font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 ${textStyles.email}`}>
                            {user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className="absolute content-stretch flex items-center justify-center right-[8px] top-[8px]" data-name="Checkbox">
                        <div className="bg-[#7f56d9] border border-[#7f56d9] border-solid relative rounded-[8px] shrink-0 size-[16px]" data-name="_Checkbox base">
                          <div className="overflow-clip relative rounded-[inherit] size-[16px]">
                            <div className="absolute bg-white inset-[31.25%] rounded-[9999px]" data-name="Check" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Account Button */}
              <div className="box-border content-stretch flex gap-[8px] items-center justify-center pb-[8px] pt-[2px] px-[8px] relative shrink-0 w-full" data-name="Menu actions">
                <div className={`${menuStyles.addAccount} border border-solid flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] shrink-0`} data-name="Buttons/Button">
                  <div className="box-border content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[inherit] w-full">
                    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="plus">
                      <div className="absolute inset-[20.833%]" data-name="Icon">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="rgba(164, 167, 174, 1)">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                    </div>
                    <div className="box-border content-stretch flex items-center justify-center px-[2px] py-0 relative shrink-0" data-name="Text padding">
                      <p className={`font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 ${textStyles.menuItem} text-[14px]`}>
                        Add account
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_0px_rgba(10,13,18,0.05)]" />
                </div>
              </div>
            </div>

            {/* Footer Items */}
            <div className="box-border content-stretch flex flex-col gap-[2px] items-start overflow-clip pb-[6px] pt-[4px] px-0 relative shrink-0 w-[264px]" data-name="Footer items">
              <div className="box-border content-stretch flex items-center px-[6px] py-0 relative shrink-0 w-full" data-name="_Nav account card menu item">
                <div className="box-border content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px overflow-clip p-[8px] relative rounded-[6px] shrink-0" data-name="Content">
                  <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" data-name="Icon and text">
                    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="log-out-01">
                      <div className="absolute inset-[12.5%]" data-name="Icon">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="rgba(164, 167, 174, 1)">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                      </div>
                    </div>
                    <p className={`flex-[1_0_0] font-['Inter:Semi_Bold',_sans-serif] font-semibold h-[20px] leading-[20px] min-h-px min-w-px not-italic relative shrink-0 ${textStyles.menuItem} text-[14px] whitespace-pre-wrap`}>
                      Sign out
                    </p>
                  </div>
                  <div className={`border ${menuStyles.shortcut} border-solid box-border content-stretch flex items-start px-[4px] py-px relative rounded-[4px] shrink-0`} data-name="Shortcut wrapper">
                    <p className={`font-['Inter:Medium',_sans-serif] font-medium leading-[18px] not-italic relative shrink-0 ${textStyles.shortcut} text-[12px]`}>
                      ⌥⇧Q
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
