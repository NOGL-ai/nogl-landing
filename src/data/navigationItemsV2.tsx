import {
    BarChartSquare02,
    NotificationBox,
    LineChartUp02,
    LineChartUp03,
    Star01,
    UserSquare,
    Settings03,
    LifeBuoy01,
    PieChart03,
    Sun,
    Sale02,
    Sale04,
    Wallet01,
    Target04,
    SearchMd,
    FileX01,
    FileCheck02,
    Package,
    PackageCheck,
    LayersThree01,
    RefreshCw01,
    TrendUp02,
    Grid03,
    BarChart02,
    Share01,
    Bell01,
    Upload01,
    Beaker02,
    BookOpen01,
    Database01,
    CheckSquare,
    Image03,
    Activity,
    CpuChip01,
} from "@untitledui/icons";
import type { ReactNode } from "react";

export interface SubMenuItem {
    label: string;
    href?: string;              // optional — accordion group headers have no href
    icon?: any;
    badge?: ReactNode;
    isSubHeading?: boolean;
    isAccordionGroup?: boolean; // renders as collapsible group header
    groupItems?: SubMenuItem[]; // children shown when accordion is open
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

// ── Badge primitives (tiny inline JSX so data file stays server-safe) ──────
function BetaPill() {
    return (
        <span className="inline-flex items-center rounded-full border border-[#d5d7da] bg-[#f5f5f5] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#717680] dark:border-[#252b37] dark:bg-[#181d27] dark:text-[#a4a7ae]">
            Beta
        </span>
    );
}

function CountBadge({ n }: { n: number }) {
    return (
        <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#fee4e2] px-1.5 py-0.5 text-[10px] font-semibold text-[#b42318] dark:bg-[#55160c] dark:text-[#fda29b]">
            {n}
        </span>
    );
}

// ── Navigation structure — 2 top-level items: Fractional CMO + Fractional CFO
export const navigationStructure: NavigationSection[] = [
    {
        section: 'main',
        items: [
            // ── 1. Fractional CMO ──────────────────────────────────────────
            {
                id: 'fractional-cmo',
                label: 'Fractional CMO',
                icon: Target04,
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
                    {
                        label: 'Market Trends',
                        href: '/en/trends',
                        icon: TrendUp02,
                    },
                    // ── Marketing Assets (accordion) ─────────────────────
                    {
                        label: 'Marketing Assets',
                        icon: LayersThree01,
                        isAccordionGroup: true,
                        groupItems: [
                            {
                                label: 'Overview',
                                href: '/en/marketing-assets',
                                icon: BarChartSquare02,
                            },
                            {
                                label: 'Creatives',
                                href: '/en/marketing-assets/creatives',
                                icon: Image03,
                            },
                            {
                                label: 'Raw Events',
                                href: '/en/marketing-assets/events',
                                icon: Database01,
                            },
                            {
                                label: 'Accounts',
                                href: '/en/marketing-assets/accounts',
                                icon: UserSquare,
                            },
                        ],
                    },

                    // ── Pricing Tools (accordion) ─────────────────────────
                    {
                        label: 'Price Alerts',
                        href: '/en/alerts',
                        icon: Bell01,
                    },
                    {
                        label: 'Pricing Tools',
                        icon: Sale02,
                        isAccordionGroup: true,
                        groupItems: [
                            {
                                label: 'Price Report',
                                icon: Sale04,
                                isAccordionGroup: true,
                                groupItems: [
                                    {
                                        label: 'Dashboard',
                                        href: '/en/dashboard',
                                        icon: BarChartSquare02,
                                    },
                                    {
                                        label: 'Price Rules',
                                        href: '/en/repricing/auto-rules',
                                        icon: RefreshCw01,
                                    },
                                    {
                                        label: 'Reports',
                                        href: '/en/reports',
                                        icon: FileX01,
                                    },
                                ],
                            },
                            {
                                label: 'Product Taxonomy',
                                href: '/en/analytics/taxonomy',
                                icon: Grid03,
                            },
                            {
                                label: 'Product Editor',
                                href: '/en/analytics/editor',
                                icon: FileX01,
                            },
                            {
                                label: 'Exports',
                                href: '/en/analytics/exports',
                                icon: Share01,
                            },
                        ],
                    },

                    // ── Product Catalog (from main) ───────────────────────
                    {
                        label: 'Product Catalog',
                        href: '/en/product-explorer',
                        icon: Package,
                    },

                    // ── Ad Scoring (from main) ────────────────────────────
                    {
                        label: 'Ad Scoring',
                        icon: Star01,
                        isAccordionGroup: true,
                        groupItems: [
                            {
                                label: 'Upload & Score',
                                href: '/en/ad-scoring/assets',
                                icon: Package,
                            },
                            {
                                label: 'Reviews',
                                href: '/en/ad-scoring/reviews',
                                icon: CheckSquare,
                            },
                            {
                                label: 'Brands',
                                href: '/en/ad-scoring/brands',
                                icon: BarChartSquare02,
                            },
                        ],
                    },

                    // ── Advanced Analytics (accordion) ────────────────────
                    {
                        label: 'Advanced Analytics',
                        icon: BarChartSquare02,
                        isAccordionGroup: true,
                        groupItems: [
                            {
                                label: 'Dashboards',
                                href: '/en/analytics/dashboards',
                                icon: BarChartSquare02,
                            },
                            {
                                label: 'Compare',
                                href: '/en/analytics/compare',
                                icon: Grid03,
                            },
                            {
                                label: 'Tools',
                                href: '/en/analytics/tools',
                                icon: BarChart02,
                            },
                            {
                                label: 'Product Export',
                                href: '/en/analytics/export',
                                icon: Share01,
                            },
                            {
                                label: 'Benchmarking',
                                href: '/en/analytics/benchmarking',
                                icon: LineChartUp03,
                            },
                        ],
                    },
                ],
            },

            // ── 2. Fractional CFO ──────────────────────────────────────────
            {
                id: 'fractional-cfo',
                label: 'Fractional CFO',
                icon: Wallet01,
                subItems: [
                    // Alerts (accordion, mirroring the screenshot)
                    {
                        label: 'Alerts',
                        icon: NotificationBox,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Overview',      href: '/en/fractional-cfo/alerts',               icon: NotificationBox },
                            { label: 'Customization', href: '/en/fractional-cfo/alerts/customization', icon: Settings03 },
                            { label: 'Inactive',      href: '/en/fractional-cfo/alerts/inactive',      icon: FileX01 },
                            { label: 'Share',         href: '/en/fractional-cfo/alerts/share',         icon: Share01 },
                            { label: 'Notifications', href: '/en/fractional-cfo/alerts/notifications', icon: NotificationBox },
                        ],
                    },
                    {
                        label: 'Forecast',
                        href: '/en/demand',
                        icon: LineChartUp02,
                    },
                    {
                        label: 'Demand Shaping',
                        href: '/en/fractional-cfo/demand-shaping',
                        icon: Beaker02,
                        badge: <BetaPill />,
                    },
                    {
                        label: 'Replenishment',
                        href: '/en/replenishment',
                        icon: PackageCheck,
                    },
                    {
                        label: 'Analytics',
                        href: '/en/fractional-cfo/analytics',
                        icon: PieChart03,
                    },
                    {
                        label: 'Docs',
                        href: '/en/fractional-cfo/docs',
                        icon: BookOpen01,
                    },
                ],
            },

            // ── 3. Import Data (global — top-level) ───────────────────────
            {
                id: 'import-data',
                label: 'Import Data',
                icon: Database01,
                subItems: [
                    {
                        label: 'Import Data',
                        href: '/en/fractional-cfo/import',
                        icon: Upload01,
                        badge: <CountBadge n={1} />,
                    },
                ],
            },

            // ── 4. Admin (ops-only, ADMIN role gate handled at route level) ──
            {
                id: 'admin-ops',
                label: 'Admin',
                icon: CpuChip01,
                subItems: [
                    {
                        label: 'Queue Monitor',
                        href: '/en/admin/queues',
                        icon: Activity,
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
                icon: Sun,
            },
        ],
    },
];

// ── Account menu (used in submenu panel footer) ────────────────────────────
export const accountMenuItem: IconMenuItem = {
    id: 'account',
    label: 'Account',
    icon: UserSquare,
    subItems: [
        { label: 'Profile',   href: '/profile',              icon: UserSquare },
        { label: 'Settings',  href: '/settings',             icon: Settings03 },
        { label: 'Support',   href: '/blog',                 icon: LifeBuoy01 },
        { label: 'Analytics', href: '/analytics/dashboards', icon: PieChart03 },
    ],
};

// ── Helpers ────────────────────────────────────────────────────────────────

function matchesUrl(href: string, activeUrl: string): boolean {
    return href === activeUrl || activeUrl.startsWith(href + '/');
}

function searchInSubItems(subItems: SubMenuItem[], activeUrl: string): boolean {
    return subItems.some((subItem) => {
        if (subItem.href && matchesUrl(subItem.href, activeUrl)) return true;
        if (subItem.groupItems) return searchInSubItems(subItem.groupItems, activeUrl);
        return false;
    });
}

export const getActiveIconMenuItem = (activeUrl: string): IconMenuItem | undefined => {
    for (const section of navigationStructure) {
        for (const item of section.items) {
            if (item.href && matchesUrl(item.href, activeUrl)) return item;
            if (item.subItems && searchInSubItems(item.subItems, activeUrl)) return item;
        }
    }
    return undefined;
};

export const getAllNavigationHrefs = (): string[] => {
    const hrefs: string[] = [];

    function collectHrefs(subItems: SubMenuItem[]) {
        subItems.forEach((item) => {
            if (item.href) hrefs.push(item.href);
            if (item.groupItems) collectHrefs(item.groupItems);
        });
    }

    navigationStructure.forEach((section) => {
        section.items.forEach((item) => {
            if (item.href) hrefs.push(item.href);
            if (item.subItems) collectHrefs(item.subItems);
        });
    });

    return hrefs;
};

export const isSubItemActive = (subItem: SubMenuItem, activeUrl: string): boolean => {
    if (!subItem.href) return false;
    return matchesUrl(subItem.href, activeUrl);
};
