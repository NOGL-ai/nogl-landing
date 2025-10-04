import { 
    BarChartSquare02, 
    HomeLine,
    Grid03,
    NotificationBox,
    LineChartUp03,
    Star01,
    ClockFastForward,
    UserSquare,
    Settings03,
    LifeBuoy01,
    PieChart03
} from "@untitledui/icons";
import type { FC, ReactNode } from "react";

export interface SubMenuItem {
    label: string;
    href: string;
    icon?: FC<{ className?: string }>;
    badge?: ReactNode;
}

export interface IconMenuItem {
    id: string;
    label: string;
    icon: FC<{ className?: string }>;
    href?: string;
    subItems?: SubMenuItem[];
}

export interface NavigationSection {
    section: 'main' | 'footer';
    items: IconMenuItem[];
}

// Main navigation structure for two-level sidebar
export const navigationStructure: NavigationSection[] = [
    {
        section: 'main',
        items: [
            {
                id: 'home',
                label: 'Home',
                icon: HomeLine,
                href: '/',
            },
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: BarChartSquare02,
                subItems: [
                    {
                        label: 'Overview',
                        href: '/dashboard',
                        icon: Grid03,
                    },
                    {
                        label: 'Notifications',
                        href: '/dashboard/notifications',
                        icon: NotificationBox,
                        badge: '10',
                    },
                    {
                        label: 'Analytics',
                        href: '/dashboard/analytics',
                        icon: LineChartUp03,
                    },
                    {
                        label: 'Saved reports',
                        href: '/dashboard/reports/saved',
                        icon: Star01,
                    },
                    {
                        label: 'Scheduled reports',
                        href: '/dashboard/reports/scheduled',
                        icon: ClockFastForward,
                    },
                    {
                        label: 'User reports',
                        href: '/dashboard/reports/users',
                        icon: UserSquare,
                    },
                ],
            },
        ],
    },
    {
        section: 'footer',
        items: [
            {
                id: 'theme-toggle',
                label: 'Theme',
                icon: Settings03,
            },
        ],
    },
];

export const accountMenuItem: IconMenuItem = {
    id: 'account',
    label: 'Account',
    icon: UserSquare,
    subItems: [
        {
            label: 'Example 1',
            href: '/account/example-1',
            icon: UserSquare,
        },
        {
            label: 'Example 2',
            href: '/account/example-2',
            icon: Settings03,
        },
        {
            label: 'Example 3',
            href: '/account/example-3',
            icon: LifeBuoy01,
        },
        {
            label: 'Example 4',
            href: '/account/example-4',
            icon: PieChart03,
        },
    ],
};

// Helper function to get all hrefs for active state detection
export const getAllNavigationHrefs = (): string[] => {
    const hrefs: string[] = [];
    
    navigationStructure.forEach(section => {
        section.items.forEach(item => {
            if (item.href) {
                hrefs.push(item.href);
            }
            if (item.subItems) {
                item.subItems.forEach(subItem => {
                    hrefs.push(subItem.href);
                });
            }
        });
    });
    
    return hrefs;
};

// Helper function to find which icon menu contains the active URL
export const getActiveIconMenuItem = (activeUrl: string): IconMenuItem | undefined => {
    for (const section of navigationStructure) {
        for (const item of section.items) {
            if (item.href === activeUrl) {
                return item;
            }
            if (item.subItems) {
                const hasActiveSubItem = item.subItems.some(subItem => subItem.href === activeUrl);
                if (hasActiveSubItem) {
                    return item;
                }
            }
        }
    }
    return undefined;
};

// Helper function to check if a sub-item is active
export const isSubItemActive = (subItem: SubMenuItem, activeUrl: string): boolean => {
    return subItem.href === activeUrl;
};
