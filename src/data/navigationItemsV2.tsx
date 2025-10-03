import { 
    BarChartSquare02, 
    Package, 
    SearchMd, 
    RefreshCw01, 
    FileX01, 
    LayersThree01,
    HomeLine,
    Grid03,
    NotificationBox,
    LineChartUp03,
    Star01,
    ClockFastForward,
    UserSquare,
    Settings03,
    LifeBuoy01,
    Settings01,
    CheckDone01,
    PieChart03,
    Users01,
    Rows01
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
            {
                id: 'catalog',
                label: 'Products',
                icon: Rows01,
                subItems: [
                    {
                        label: 'Product Catalog',
                        href: '/catalog',
                        icon: Package,
                    },
                    {
                        label: 'Example 1',
                        href: '/catalog/example-1',
                        icon: Package,
                    },
                    {
                        label: 'Example 2',
                        href: '/catalog/example-2',
                        icon: Package,
                    },
                    {
                        label: 'Example 3',
                        href: '/catalog/example-3',
                        icon: Package,
                    },
                ],
            },
            {
                id: 'tasks',
                label: 'Tasks',
                icon: CheckDone01,
                subItems: [
                    {
                        label: 'Example 1',
                        href: '/tasks/example-1',
                    },
                    {
                        label: 'Example 2',
                        href: '/tasks/example-2',
                    },
                    {
                        label: 'Example 3',
                        href: '/tasks/example-3',
                    },
                    {
                        label: 'Example 4',
                        href: '/tasks/example-4',
                    },
                ],
            },
            {
                id: 'reports',
                label: 'Reports',
                icon: PieChart03,
                subItems: [
                    {
                        label: 'Example 1',
                        href: '/reports/example-1',
                    },
                    {
                        label: 'Example 2',
                        href: '/reports/example-2',
                    },
                ],
            },
            {
                id: 'team',
                label: 'Team',
                icon: Users01,
                subItems: [
                    {
                        label: 'Example 1',
                        href: '/team/example-1',
                    },
                    {
                        label: 'Example 2',
                        href: '/team/example-2',
                    },
                    {
                        label: 'Example 3',
                        href: '/team/example-3',
                    },
                ],
            },
        ],
    },
    {
        section: 'footer',
        items: [
            {
                id: 'support',
                label: 'Support',
                icon: LifeBuoy01,
                href: '/support',
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: Settings01,
                href: '/settings',
            },
        ],
    },
];

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

