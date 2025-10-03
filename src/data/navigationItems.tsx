import { BarChartSquare02, Package, SearchMd, RefreshCw01, FileX01, LayersThree01, Settings01, User01 } from "@untitledui/icons";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { Badge } from "@/components/base/badges/badges";

const navItemsWithSectionsSubheadings: Array<{ label: string; items: NavItemType[] }> = [
    {
        label: "Main",
        items: [
            {
                label: "Dashboard",
                href: "/dashboard",
                icon: BarChartSquare02,
            },
            {
                label: "My Catalog",
                href: "/catalog",
                icon: Package,
            },
            {
                label: "Competitors",
                href: "/competitors",
                icon: SearchMd,
                badge: (
                    <Badge size="sm" type="modern">
                        2
                    </Badge>
                ),
            },
            {
                label: "Repricing",
                href: "/repricing",
                icon: RefreshCw01,
                badge: (
                    <Badge size="sm" type="modern">
                        3
                    </Badge>
                ),
            },
            {
                label: "Reports",
                href: "/reports",
                icon: FileX01,
            },
            {
                label: "Product Feed",
                href: "/product-feed",
                icon: LayersThree01,
            },
        ],
    },
    {
        label: "Competitors",
        items: [
            {
                label: "Competitor",
                href: "/competitors/competitor",
                icon: SearchMd,
            },
            {
                label: "Monitored URLs",
                href: "/competitors/monitored-urls",
                icon: SearchMd,
            },
        ],
    },
    {
        label: "Repricing",
        items: [
            {
                label: "Auto Repricing Rules",
                href: "/repricing/auto-rules",
                icon: RefreshCw01,
            },
            {
                label: "Auto Repricing Overview",
                href: "/repricing/auto-overview",
                icon: RefreshCw01,
            },
            {
                label: "Auto Repricing History",
                href: "/repricing/auto-history",
                icon: RefreshCw01,
            },
        ],
    },
    {
        label: "Settings",
        items: [
            {
                label: "Settings",
                href: "/settings",
                icon: Settings01,
            },
            {
                label: "My Account",
                href: "/account",
                icon: User01,
            },
        ],
    },
];

export const SidebarNavigationSectionsSubheadingsDemo = () => {
    // This will be replaced with the actual sidebar component
    return null;
};

export { navItemsWithSectionsSubheadings };
