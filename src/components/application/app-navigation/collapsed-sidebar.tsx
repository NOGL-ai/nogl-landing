"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { 
    BarChartSquare02, 
    Package, 
    SearchMd, 
    RefreshCw01, 
    FileX01, 
    LayersThree01,
    LifeBuoy01,
    Settings01
} from "@untitledui/icons";

interface CollapsedSidebarProps {
    user?: {
        name?: string;
        email?: string;
        avatar?: string;
    };
    onLogout?: () => void;
    onNavigate?: (href: string) => void;
}

const CollapsedSidebar: React.FC<CollapsedSidebarProps> = ({
    user,
    onLogout,
    onNavigate
}) => {
    const pathname = usePathname();
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    const navigationItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: BarChartSquare02,
        },
        {
            label: "Competitor Intelligence",
            href: "/competitors",
            icon: SearchMd,
        },
        {
            label: "Product Catalog",
            href: "/catalog",
            icon: Package,
        },
        {
            label: "Data Feeds",
            href: "/product-feed",
            icon: LayersThree01,
        },
        {
            label: "Price Rules",
            href: "/repricing",
            icon: RefreshCw01,
        },
        {
            label: "Reports",
            href: "/reports",
            icon: FileX01,
        },
    ];

    const footerItems = [
        {
            label: "Support",
            href: "/support",
            icon: LifeBuoy01,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: Settings01,
        },
    ];

    const handleNavigation = (href: string) => {
        if (onNavigate) {
            onNavigate(href);
        } else {
            window.location.href = href;
        }
    };

    const isActive = (href: string) => {
        return pathname === href;
    };

    return (
        <div 
            className="fixed left-0 top-0 z-50 h-screen w-16 bg-white border-r border-[#e9eaeb] dark:bg-[#0a0d12] dark:border-[#252b37] group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Collapsed Sidebar */}
            <div className="flex flex-col h-full">
                {/* Header with Logo */}
                <div className="flex items-center justify-center p-4 border-b border-[#e9eaeb] dark:border-[#252b37]">
                    <div className="h-8 w-8 relative">
                        <div 
                            className="border-[0.2px] border-[rgba(10,13,18,0.12)] border-solid relative rounded-[8px] shrink-0 size-[32px]" 
                            style={{ 
                                backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(10, 13, 18, 0.2) 100%), linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)" 
                            }}
                        >
                            <div className="overflow-clip relative rounded-[inherit] size-[32px]">
                                <div className="absolute inset-0">
                                    <svg
                                        width='32'
                                        height='32'
                                        viewBox='0 0 30 30'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className="block max-w-none size-full"
                                    >
                                        <path
                                            d='M18.7422 19.5789C19.2754 19.5789 19.9931 18.9436 23.9712 14.9676C26.514 12.4263 28.6876 10.3564 28.7901 10.3564C28.9132 10.3564 29.1182 10.4383 29.2412 10.5203C29.3848 10.6023 29.6104 11.1762 29.7539 11.791C29.8974 12.4058 30 13.8814 30 15.0701C30 16.4227 29.8769 17.7139 29.6514 18.5542C29.4668 19.292 28.8926 20.7266 28.4005 21.7308C27.7648 23.022 27.0881 24.0262 26.1039 25.0919C25.3246 25.9117 24.0943 26.9979 23.3561 27.4897C22.6384 27.9611 21.4695 28.5965 20.7928 28.8834C20.1161 29.1498 18.7833 29.5392 17.8195 29.7441C16.5686 29.9901 15.5843 30.0515 14.231 29.9696C13.2262 29.9081 11.8318 29.7031 11.1551 29.5392C10.4784 29.3547 9.14549 28.8219 8.20222 28.3505C7.17693 27.8177 5.94658 26.9774 5.14685 26.2396C4.40864 25.5633 3.46537 24.5796 3.03474 24.0467C2.48109 23.3704 2.23502 22.858 2.23502 22.4071C2.23502 21.8128 2.68614 21.2799 6.50024 17.4884C9.78118 14.1888 10.868 13.2256 11.2576 13.2256C11.6472 13.2461 12.5905 14.0454 14.9487 16.4022C17.6349 19.0665 18.2296 19.5584 18.7422 19.5789Z'
                                            fill='#375DFB'
                                        />
                                        <path
                                            d='M10.5605 0.643081C11.1142 0.458631 12.1395 0.233187 12.8162 0.130715C13.4929 0.00774801 14.8257 -0.0332346 15.7895 0.0282489C16.7533 0.0692378 18.0862 0.253698 18.7629 0.417653C19.4396 0.602104 20.5469 0.991487 21.2236 1.2989C21.9003 1.62682 22.9051 2.20067 23.4792 2.56957C24.0329 2.95897 24.8736 3.59429 25.3042 4.00418C25.7554 4.39358 26.5141 5.27484 27.0062 5.95116C27.4984 6.62747 27.9085 7.38578 27.888 7.63171C27.888 7.93913 27.3343 8.67693 26.3911 9.64017C25.5913 10.5009 24.7506 11.1772 24.5455 11.1772C24.3405 11.1772 23.8893 10.6854 23.4587 9.98857C23.0486 9.35325 22.4744 8.55396 22.1668 8.22605C21.8798 7.89814 21.08 7.2833 20.4033 6.83242C19.7267 6.40203 18.5783 5.84869 17.8401 5.62325C17.0404 5.37732 15.9331 5.23386 15.0718 5.23386C14.2721 5.23386 13.1648 5.35683 12.6111 5.52078C12.0369 5.66425 11.0937 6.03313 10.499 6.32005C9.92484 6.62747 9.00208 7.2628 8.46893 7.73418C7.95628 8.22605 7.23857 9.06633 6.86947 9.64017C6.52087 10.1935 6.04923 11.0748 5.86468 11.5871C5.65962 12.0995 5.41355 13.2882 5.14697 15.9935L3.34246 17.797C2.35818 18.7807 1.37389 19.58 1.16883 19.58C0.984282 19.58 0.738211 19.4161 0.635682 19.2111C0.533153 19.0267 0.3486 18.2683 0.225565 17.5305C0.102529 16.7927 0 15.6246 0 14.9073C0 14.2104 0.143541 12.9193 0.328094 12.038C0.512647 11.1773 0.881753 9.90659 1.16883 9.23027C1.45592 8.55396 2.07109 7.40627 2.56323 6.66847C3.03487 5.93066 4.08067 4.74198 4.85989 4.00418C5.70063 3.2049 6.95149 2.32365 7.91527 1.83178C8.79702 1.36041 9.98636 0.827532 10.5605 0.643081Z'
                                            fill='#00C8F4'
                                        />
                                    </svg>
                                </div>
                                <div className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.2)] bottom-0 left-0 right-0 rounded-bl-[8px] rounded-br-[8px] top-1/2" />
                            </div>
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_-0.5px_0.5px_0px_rgba(10,13,18,0.1)]" />
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 flex flex-col items-center py-4 space-y-2">
                    {navigationItems.map((item, index) => {
                        const IconComponent = item.icon;
                        const active = isActive(item.href);
                        
                        return (
                            <button
                                key={index}
                                onClick={() => handleNavigation(item.href)}
                                className={`
                                    flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200
                                    ${active 
                                        ? 'bg-neutral-50 dark:bg-[#252b37]' 
                                        : 'hover:bg-gray-50 dark:hover:bg-[#252b37]/50'
                                    }
                                `}
                                title={item.label}
                                aria-label={item.label}
                            >
                                <IconComponent 
                                    className={`w-5 h-5 ${
                                        active 
                                            ? 'text-[#717680] dark:text-[#a4a7ae]' 
                                            : 'text-[#a4a7ae] dark:text-[#717680]'
                                    }`} 
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Footer Items */}
                <div className="flex flex-col items-center space-y-2 pb-4">
                    {footerItems.map((item, index) => {
                        const IconComponent = item.icon;
                        const active = isActive(item.href);
                        
                        return (
                            <button
                                key={index}
                                onClick={() => handleNavigation(item.href)}
                                className={`
                                    flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200
                                    ${active 
                                        ? 'bg-neutral-50 dark:bg-[#252b37]' 
                                        : 'hover:bg-gray-50 dark:hover:bg-[#252b37]/50'
                                    }
                                `}
                                title={item.label}
                                aria-label={item.label}
                            >
                                <IconComponent 
                                    className={`w-5 h-5 ${
                                        active 
                                            ? 'text-[#717680] dark:text-[#a4a7ae]' 
                                            : 'text-[#a4a7ae] dark:text-[#717680]'
                                    }`} 
                                />
                            </button>
                        );
                    })}

                    {/* User Avatar */}
                    <div className="relative mt-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#252b37] flex items-center justify-center">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name || 'User'} 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-6 h-6 bg-[#17b26a] rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#17b26a] border-2 border-white dark:border-[#0a0d12] rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Expanded Hover State */}
            {isHovered && (
                <div className="absolute left-16 top-0 w-64 h-full bg-white dark:bg-[#0a0d12] border-r border-[#e9eaeb] dark:border-[#252b37] shadow-xl z-50 rounded-r-lg">
                    <div className="flex flex-col h-full p-4">
                        {/* Header with Logo and Title */}
                        <div className="flex items-center gap-3 pb-4 border-b border-[#e9eaeb] dark:border-[#252b37]">
                            <div className="h-8 w-8 relative">
                                <div 
                                    className="border-[0.2px] border-[rgba(10,13,18,0.12)] border-solid relative rounded-[8px] shrink-0 size-[32px]" 
                                    style={{ 
                                        backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(10, 13, 18, 0.2) 100%), linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)" 
                                    }}
                                >
                                    <div className="overflow-clip relative rounded-[inherit] size-[32px]">
                                        <div className="absolute inset-0">
                                            <svg
                                                width='32'
                                                height='32'
                                                viewBox='0 0 30 30'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className="block max-w-none size-full"
                                            >
                                                <path
                                                    d='M18.7422 19.5789C19.2754 19.5789 19.9931 18.9436 23.9712 14.9676C26.514 12.4263 28.6876 10.3564 28.7901 10.3564C28.9132 10.3564 29.1182 10.4383 29.2412 10.5203C29.3848 10.6023 29.6104 11.1762 29.7539 11.791C29.8974 12.4058 30 13.8814 30 15.0701C30 16.4227 29.8769 17.7139 29.6514 18.5542C29.4668 19.292 28.8926 20.7266 28.4005 21.7308C27.7648 23.022 27.0881 24.0262 26.1039 25.0919C25.3246 25.9117 24.0943 26.9979 23.3561 27.4897C22.6384 27.9611 21.4695 28.5965 20.7928 28.8834C20.1161 29.1498 18.7833 29.5392 17.8195 29.7441C16.5686 29.9901 15.5843 30.0515 14.231 29.9696C13.2262 29.9081 11.8318 29.7031 11.1551 29.5392C10.4784 29.3547 9.14549 28.8219 8.20222 28.3505C7.17693 27.8177 5.94658 26.9774 5.14685 26.2396C4.40864 25.5633 3.46537 24.5796 3.03474 24.0467C2.48109 23.3704 2.23502 22.858 2.23502 22.4071C2.23502 21.8128 2.68614 21.2799 6.50024 17.4884C9.78118 14.1888 10.868 13.2256 11.2576 13.2256C11.6472 13.2461 12.5905 14.0454 14.9487 16.4022C17.6349 19.0665 18.2296 19.5584 18.7422 19.5789Z'
                                                    fill='#375DFB'
                                                />
                                                <path
                                                    d='M10.5605 0.643081C11.1142 0.458631 12.1395 0.233187 12.8162 0.130715C13.4929 0.00774801 14.8257 -0.0332346 15.7895 0.0282489C16.7533 0.0692378 18.0862 0.253698 18.7629 0.417653C19.4396 0.602104 20.5469 0.991487 21.2236 1.2989C21.9003 1.62682 22.9051 2.20067 23.4792 2.56957C24.0329 2.95897 24.8736 3.59429 25.3042 4.00418C25.7554 4.39358 26.5141 5.27484 27.0062 5.95116C27.4984 6.62747 27.9085 7.38578 27.888 7.63171C27.888 7.93913 27.3343 8.67693 26.3911 9.64017C25.5913 10.5009 24.7506 11.1772 24.5455 11.1772C24.3405 11.1772 23.8893 10.6854 23.4587 9.98857C23.0486 9.35325 22.4744 8.55396 22.1668 8.22605C21.8798 7.89814 21.08 7.2833 20.4033 6.83242C19.7267 6.40203 18.5783 5.84869 17.8401 5.62325C17.0404 5.37732 15.9331 5.23386 15.0718 5.23386C14.2721 5.23386 13.1648 5.35683 12.6111 5.52078C12.0369 5.66425 11.0937 6.03313 10.499 6.32005C9.92484 6.62747 9.00208 7.2628 8.46893 7.73418C7.95628 8.22605 7.23857 9.06633 6.86947 9.64017C6.52087 10.1935 6.04923 11.0748 5.86468 11.5871C5.65962 12.0995 5.41355 13.2882 5.14697 15.9935L3.34246 17.797C2.35818 18.7807 1.37389 19.58 1.16883 19.58C0.984282 19.58 0.738211 19.4161 0.635682 19.2111C0.533153 19.0267 0.3486 18.2683 0.225565 17.5305C0.102529 16.7927 0 15.6246 0 14.9073C0 14.2104 0.143541 12.9193 0.328094 12.038C0.512647 11.1773 0.881753 9.90659 1.16883 9.23027C1.45592 8.55396 2.07109 7.40627 2.56323 6.66847C3.03487 5.93066 4.08067 4.74198 4.85989 4.00418C5.70063 3.2049 6.95149 2.32365 7.91527 1.83178C8.79702 1.36041 9.98636 0.827532 10.5605 0.643081Z'
                                                    fill='#00C8F4'
                                                />
                                            </svg>
                                        </div>
                                        <div className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.2)] bottom-0 left-0 right-0 rounded-bl-[8px] rounded-br-[8px] top-1/2" />
                                    </div>
                                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_-0.5px_0.5px_0px_rgba(10,13,18,0.1)]" />
                                </div>
                            </div>
                            <span className="text-lg font-semibold text-[#181d27] dark:text-[#e9eaeb]">NOGL</span>
                        </div>

                        {/* Navigation Items with Labels */}
                        <div className="flex-1 py-4 space-y-1">
                            {navigationItems.map((item, index) => {
                                const IconComponent = item.icon;
                                const active = isActive(item.href);
                                
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleNavigation(item.href)}
                                        className={`
                                            flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all duration-200 text-left
                                            ${active 
                                                ? 'bg-neutral-50 dark:bg-[#252b37]' 
                                                : 'hover:bg-gray-50 dark:hover:bg-[#252b37]/50'
                                            }
                                        `}
                                    >
                                        <IconComponent 
                                            className={`w-5 h-5 ${
                                                active 
                                                    ? 'text-[#717680] dark:text-[#a4a7ae]' 
                                                    : 'text-[#a4a7ae] dark:text-[#717680]'
                                            }`} 
                                        />
                                        <span className={`text-sm font-medium ${
                                            active 
                                                ? 'text-[#181d27] dark:text-[#e9eaeb]' 
                                                : 'text-[#717680] dark:text-[#a4a7ae]'
                                        }`}>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer Items with Labels */}
                        <div className="space-y-1 pb-4">
                            {footerItems.map((item, index) => {
                                const IconComponent = item.icon;
                                const active = isActive(item.href);
                                
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleNavigation(item.href)}
                                        className={`
                                            flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all duration-200 text-left
                                            ${active 
                                                ? 'bg-neutral-50 dark:bg-[#252b37]' 
                                                : 'hover:bg-gray-50 dark:hover:bg-[#252b37]/50'
                                            }
                                        `}
                                    >
                                        <IconComponent 
                                            className={`w-5 h-5 ${
                                                active 
                                                    ? 'text-[#717680] dark:text-[#a4a7ae]' 
                                                    : 'text-[#a4a7ae] dark:text-[#717680]'
                                            }`} 
                                        />
                                        <span className={`text-sm font-medium ${
                                            active 
                                                ? 'text-[#181d27] dark:text-[#e9eaeb]' 
                                                : 'text-[#717680] dark:text-[#a4a7ae]'
                                        }`}>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pt-4 border-t border-[#e9eaeb] dark:border-[#252b37]">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#252b37] flex items-center justify-center">
                                    {user?.avatar ? (
                                        <img 
                                            src={user.avatar} 
                                            alt={user.name || 'User'} 
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-5 h-5 bg-[#17b26a] rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">
                                                {user?.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Online indicator */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#17b26a] border-2 border-white dark:border-[#0a0d12] rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#181d27] dark:text-[#e9eaeb] truncate">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-xs text-[#717680] dark:text-[#a4a7ae] truncate">
                                    {user?.email || 'user@example.com'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollapsedSidebar;
