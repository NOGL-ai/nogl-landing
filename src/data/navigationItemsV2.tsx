import {
    BarChartSquare02,
    HomeLine,
    Star01,
    UserSquare,
    Settings03,
    LifeBuoy01,
    PieChart03,
    Sun,
    Sale02,
    FileX01,
    SearchMd,
    RefreshCw01,
    TrendUp02,
    Grid03,
    Package,
    BarChart02,
    Share01,
    Bell01,
    NotificationBox,
    AlertTriangle,
} from "@untitledui/icons";
import type { ReactNode } from "react";

export interface SubMenuItem {
    label: string;
    href: string;
    icon?: any;
    badge?: ReactNode;
    isSubHeading?: boolean;
}

export interface IconMenuItem {
    id: string;
    label: string;
    icon: any;
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
                id: 'price-report',
                label: 'Price Report',
                icon: Sale02,
                subItems: [
                    {
                        label: 'Dashboard',
                        href: '/dashboard',
                        icon: BarChartSquare02,
                    },
                    {
                        label: 'Price Rules',
                        href: '/repricing/auto-rules',
                        icon: RefreshCw01,
                    },
                    {
                        label: 'Reports',
                        href: '/reports',
                        icon: FileX01,
                    },
                ],
            },
            {
                id: 'competitor-explorer',
                label: 'Competitor Explorer',
                icon: SearchMd,
                subItems: [
                    {
                        label: 'Competitor Explorer',
                        href: '/en/companies',
                        icon: SearchMd,
                    },
                    {
                        label: 'Tracked Competitors',
                        href: '/en/companies/competitor',
                        icon: Star01,
                    },
                ],
            },
            {
                id: 'trends',
                label: 'Trends',
                icon: TrendUp02,
                subItems: [
                    {
                        label: 'Market Trends',
                        href: '/trends',
                        icon: TrendUp02,
                    },
                ],
            },
            {
                id: 'marketing-assets',
                label: 'Marketing Asset Library',
                icon: Package,
                subItems: [
                    {
                        label: 'Asset Library',
                        href: '/marketing-assets',
                        icon: Package,
                    },
                ],
            },
            {
                id: 'pricing-suite',
                label: 'Pricing Suite',
                icon: BarChart02,
                subItems: [
                    {
                        label: 'Price Alerts',
                        href: '/en/alerts',
                        icon: Bell01,
                    },
                    {
                        label: 'Pricing Tools',
                        href: '/pricing-suite',
                        icon: BarChart02,
                    },
                ],
            },
            {
                id: 'fractional-cfo',
                label: 'Fractional CFO',
                icon: AlertTriangle,
                subItems: [
                    {
                        label: 'Alerts',
                        href: '/en/fractional-cfo/alerts',
                        icon: NotificationBox,
                    },
                    {
                        label: 'Notifications',
                        href: '/en/fractional-cfo/alerts/notifications',
                        icon: Bell01,
                    },
                ],
            },
            {
                id: 'product-explorer',
                label: 'Product Explorer',
                icon: Package,
                subItems: [
                    {
                        label: 'Product Catalog',
                        href: '/product-explorer',
                        icon: Package,
                    },
                ],
            },
            {
                id: 'advanced-analytics',
                label: 'Advanced Analytics',
                icon: BarChart02,
                subItems: [
                    {
                        label: 'Dashboards',
                        href: '/analytics/dashboards',
                        icon: BarChartSquare02,
                    },
                    {
                        label: 'Compare',
                        href: '/analytics/compare',
                        icon: Grid03,
                    },
                    {
                        label: 'Tools',
                        href: '/analytics/tools',
                        icon: BarChart02,
                    },
                    {
                        label: 'Product Taxonomy',
                        href: '/analytics/taxonomy',
                        icon: Package,
                    },
                    {
                        label: 'Product Export',
                        href: '/analytics/export',
                        icon: Share01,
                    },
                    {
                        label: 'Editor',
                        href: '/analytics/editor',
                        icon: FileX01,
                    },
                    {
                        label: 'Exports',
                        href: '/analytics/exports',
                        icon: Share01,
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
                icon: Sun, // Dynamically changed based on theme
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
            label: 'Profile',
            href: '/account/profile',
            icon: UserSquare,
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: Settings03,
        },
        {
            label: 'Support',
            href: '/support',
            icon: LifeBuoy01,
        },
        {
            label: 'Analytics',
            href: '/account/analytics',
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
// Supports prefix matching so /en/companies/calumet-de/pricing matches competitor-explorer
export const getActiveIconMenuItem = (activeUrl: string): IconMenuItem | undefined => {
    for (const section of navigationStructure) {
        for (const item of section.items) {
            if (item.href && (item.href === activeUrl || activeUrl.startsWith(item.href + '/'))) {
                return item;
            }
            if (item.subItems) {
                const hasActiveSubItem = item.subItems.some(subItem =>
                    subItem.href === activeUrl || activeUrl.startsWith(subItem.href + '/')
                );
                if (hasActiveSubItem) {
                    return item;
                }
            }
        }
    }
    return undefined;
};

// Helper function to check if a sub-item is active
// Uses exact match so that /en/companies/competitor doesn't also highlight
// the parent /en/companies sub-item entry
export const isSubItemActive = (subItem: SubMenuItem, activeUrl: string): boolean => {
    return subItem.href === activeUrl;
};
