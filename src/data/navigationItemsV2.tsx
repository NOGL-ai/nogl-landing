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
    Upload01,
    Beaker02,
    BookOpen01,
    Database01,
    CheckSquare,
    Activity,
    Folder,
    CpuChip01,
    Link01,
    SwitchHorizontal01 as CompareCompaniesIcon,
} from "@untitledui/icons";
import type { ReactNode } from "react";

export interface SubMenuItem {
    label: string;
    href?: string;              // optional — accordion group headers and TBD placeholders have no href
    icon?: any;
    badge?: ReactNode;
    isSubHeading?: boolean;
    isAccordionGroup?: boolean; // renders as collapsible group header
    groupItems?: SubMenuItem[]; // children shown when accordion is open
}

export interface IconMenuItem {
    id: string;
    label: string;
    /** Expanded flyout title (defaults to `label` when omitted). */
    panelTitle?: string;
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

function TbdPill() {
    return (
        <span className="inline-flex items-center rounded-full border border-[#e9d7fe] bg-[#f4ebff] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#6941c6] dark:border-[#3e1c96] dark:bg-[#2d1b69] dark:text-[#d6bbfd]">
            TBD
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

// ── Navigation structure ───────────────────────────────────────────────────
export const navigationStructure: NavigationSection[] = [
    {
        section: 'main',
        items: [
            // ── 1. Fractional CMO (market intelligence) — UNCHANGED ───────
            {
                id: 'fractional-cmo',
                label: 'Fractional CMO',
                panelTitle: 'Marketing & analytics',
                icon: Target04,
                subItems: [
                    {
                        label: 'Digital Shelf Analytics',
                        icon: BarChartSquare02,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Competitor Explorer', href: '/en/companies',                  icon: SearchMd },
                            { label: 'Tracked Competitors', href: '/en/companies/competitor',       icon: Star01 },
                            { label: 'Trends',              href: '/en/trends',                     icon: TrendUp02 },
                            { label: 'Asset Library',       href: '/en/marketing-assets',           icon: LayersThree01 },
                            { label: 'Events Feed',         href: '/en/marketing-assets/events',    icon: Database01 },
                            { label: 'Ingestion health',    href: '/en/marketing-assets/pipeline',  icon: Activity },
                            { label: 'Product Explorer',    href: '/en/product-explorer',           icon: Package },
                            { label: 'Product taxonomy',    href: '/en/product-taxonomy',           icon: Folder },
                            { label: 'Product Editor',      href: '/en/product-editor',             icon: Folder },
                        ],
                    },
                    {
                        label: 'Creative Scoring',
                        icon: Beaker02,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Upload & Score', href: '/en/ad-scoring/assets',  icon: Upload01 },
                            { label: 'Reviews',        href: '/en/ad-scoring/reviews', icon: CheckSquare },
                            { label: 'Brands',         href: '/en/ad-scoring/brands',  icon: BarChartSquare02 },
                        ],
                    },
                    {
                        label: 'Advanced Analysis',
                        icon: BarChartSquare02,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Dashboards',          href: '/en/analytics/dashboards',     icon: BarChartSquare02 },
                            { label: 'Compare',             href: '/en/analytics/compare',        icon: CompareCompaniesIcon },
                            { label: 'Competitive Compare', href: '/en/analytics/multi-company',  icon: Grid03 },
                            { label: 'Product Matrix',      href: '/en/analytics/product-matrix', icon: Grid03 },
                            { label: 'Benchmarking',        href: '/en/analytics/benchmarking',   icon: LineChartUp03 },
                            { label: 'White Space',         href: '/en/analytics/white-space',    icon: BarChart02 },
                        ],
                    },
                    {
                        label: 'Tools',
                        icon: Settings03,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Taxonomy',       href: '/en/tools/taxonomy',       icon: Grid03 },
                            { label: 'Product Editor', href: '/en/tools/product-editor', icon: FileCheck02 },
                            { label: 'Exports',        href: '/en/tools/exports',        icon: Share01 },
                        ],
                    },
                ],
            },

            // ── 2. Fractional CFO (pricing & finance) — REBUILT ───────────
            {
                id: 'fractional-cfo',
                label: 'Fractional CFO',
                icon: Wallet01,
                subItems: [
                    // 2.1 — Dashboard (placeholder page already exists)
                    {
                        label: 'Dashboard',
                        href: '/en/fractional-cfo/dashboards',
                        icon: BarChartSquare02,
                    },
                    // 2.2 — Alerts accordion
                    {
                        label: 'Alerts',
                        icon: NotificationBox,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Overview',       href: '/en/fractional-cfo/alerts',                icon: NotificationBox },
                            { label: 'Inbox',          href: '/en/fractional-cfo/alerts/inbox',          icon: NotificationBox },
                            { label: 'Customization',  href: '/en/fractional-cfo/alerts/customization',  icon: Settings03 },
                            { label: 'Inactive',       href: '/en/fractional-cfo/alerts/inactive',       icon: FileX01 },
                            { label: 'Share',          href: '/en/fractional-cfo/alerts/share',          icon: Share01 },
                            { label: 'Notifications',  icon: NotificationBox, badge: <TbdPill /> },
                        ],
                    },
                    // 2.3 — Repricing accordion (3 items, "Manage" removed)
                    {
                        label: 'Repricing',
                        icon: RefreshCw01,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Preview', href: '/en/repricing/auto-overview', icon: FileCheck02 },
                            { label: 'Rules',   href: '/en/repricing/auto-rules',    icon: RefreshCw01 },
                            { label: 'History', href: '/en/repricing/auto-history',  icon: FileX01 },
                        ],
                    },
                    // 2.4 — Forecasting accordion (placeholders; user fills in later)
                    {
                        label: 'Forecasting',
                        icon: LineChartUp02,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Overview',        href: '/en/fractional-cfo/forecast/overview', icon: LineChartUp02 },
                            { label: 'Demand Overview', icon: TrendUp02, badge: <TbdPill /> },
                        ],
                    },
                    // 2.5 — Demand Shaping accordion
                    {
                        label: 'Demand Shaping',
                        icon: Beaker02,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Overview', href: '/en/fractional-cfo/demand-shaping', icon: Beaker02, badge: <BetaPill /> },
                        ],
                    },
                    // 2.6 — Replenishment accordion
                    {
                        label: 'Replenishment',
                        icon: PackageCheck,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Overview', href: '/en/replenishment', icon: PackageCheck },
                        ],
                    },
                    // 2.7 — Analytics accordion
                    {
                        label: 'Analytics',
                        icon: PieChart03,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Overview', href: '/en/fractional-cfo/analytics', icon: PieChart03 },
                        ],
                    },
                    // 2.8 — Docs accordion
                    {
                        label: 'Docs',
                        icon: BookOpen01,
                        isAccordionGroup: true,
                        groupItems: [
                            { label: 'Overview', href: '/en/fractional-cfo/docs', icon: BookOpen01 },
                        ],
                    },
                ],
            },

            // ── 3. Import Data (top-level, below CFO, single link) ────────
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

            // ── 4. Integrations (top-level, NEW) ──────────────────────────
            {
                id: 'integrations',
                label: 'Integrations',
                icon: Link01,
                subItems: [
                    { label: 'Amazon', icon: Package, badge: <TbdPill /> },
                ],
            },

            // ── 5. Admin (top-level, expanded) ────────────────────────────
            {
                id: 'admin-ops',
                label: 'Admin',
                icon: CpuChip01,
                subItems: [
                    { label: 'System Health',      icon: Activity,        badge: <TbdPill /> },
                    { label: 'CSM',                icon: UserSquare,      badge: <TbdPill /> },
                    { label: 'Alerts Analyzer',    icon: BarChart02,      badge: <TbdPill /> },
                    { label: 'Onboarding',         icon: Star01,          badge: <TbdPill /> },
                    { label: 'Migrations',         icon: RefreshCw01,     badge: <TbdPill /> },
                    { label: 'Optimized Inventory', icon: Package,        badge: <TbdPill /> },
                    { label: 'Import Data',        href: '/en/fractional-cfo/import', icon: Upload01 },
                    { label: 'Queue Monitor',      href: '/en/admin/queues', icon: Activity },
                ],
            },

            // ── 6. Sync ───────────────────────────────────────────────────
            // TODO: green-dot indicator goes here, NOT a nav item — see HTML mockup .synced-dot

            // ── 7. Settings (top-level, NEW) ──────────────────────────────
            {
                id: 'settings',
                label: 'Settings',
                icon: Settings03,
                subItems: [
                    { label: 'Settings', href: '/settings', icon: Settings03, badge: <TbdPill /> },
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
