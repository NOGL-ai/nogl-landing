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
    PieChart03,
    Sun,
    Sale02,
    Sale04,
    CreditCard01,
    Wallet01,
    SearchMd,
    FileX01,
    Package,
    LayersThree01,
    RefreshCw01,
    TrendUp02,
    ShoppingCart01,
    Truck01
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
                id: 'pricing',
                label: 'Pricing',
                icon: Sale02,
                subItems: [
                    {
                        label: 'Dashboard',
                        href: '/dashboard',
                        icon: BarChartSquare02,
                    },
                    {
                        label: 'Competitor Intelligence',
                        href: '/competitors/competitor',
                        icon: SearchMd,
                    },
                    {
                        label: 'Price Rules',
                        href: '/repricing',
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
                id: 'market-research',
                label: 'Market Research',
                icon: TrendUp02,
                subItems: [
                    {
                        label: 'Market Intelligence',
                        href: '/market-research/intelligence',
                        icon: LineChartUp03,
                    },
                    {
                        label: 'Trends Dashboard',
                        href: '/market-research/trends',
                        icon: BarChartSquare02,
                    },
                    {
                        label: 'Customer Insights',
                        href: '/market-research/insights',
                        icon: UserSquare,
                    },
                ],
            },
            {
                id: 'products',
                label: 'Products',
                icon: Package,
                subItems: [
                    {
                        label: 'Product Catalog',
                        href: '/catalog',
                        icon: Package,
                    },
                    {
                        label: 'Data Feeds',
                        href: '/product-feed',
                        icon: LayersThree01,
                    },
                    {
                        label: 'Product Management',
                        href: '/products/management',
                        icon: Grid03,
                    },
                ],
            },
            {
                id: 'supply-chain',
                label: 'Supply Chain',
                icon: Truck01,
                subItems: [
                    {
                        label: 'Demand Forecasting',
                        href: '/supply-chain/forecasting',
                        icon: LineChartUp03,
                    },
                    {
                        label: 'Inventory Planning',
                        href: '/supply-chain/inventory',
                        icon: LayersThree01,
                    },
                    {
                        label: 'Procurement',
                        href: '/supply-chain/procurement',
                        icon: ShoppingCart01,
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
                icon: Sun, // Will be dynamically changed based on theme
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
