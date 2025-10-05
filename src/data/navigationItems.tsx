import { 
    BarChartSquare02, 
    Package, 
    SearchMd, 
    RefreshCw01, 
    FileX01, 
    LayersThree01,
    Tag01
} from "@untitledui/icons";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { SidebarNavigationSectionsSubheadings } from "@/components/application/app-navigation/sidebar-navigation/sidebar-sections-subheadings";

const navItemsWithSectionsSubheadings: Array<{ label: string; items: NavItemType[] }> = [
    {
        label: "Analytics",
        items: [
            {
                label: "Dashboard",
                href: "/dashboard",
                icon: BarChartSquare02,
            },
            {
                label: "Competitor Intelligence",
                href: "/competitors/competitor",
                icon: SearchMd,
            },
            {
                label: "Reports",
                href: "/reports",
                icon: FileX01,
            },
        ],
    },
    {
        label: "Data Management",
        items: [
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
        ],
    },
    // {
    //     label: "Your Brands",
    //     items: [
    //         {
    //             label: "Elli",
    //             href: "/brands/elli",
    //             icon: Tag01,
    //         },
    //         {
    //             label: "Stilnest",
    //             href: "/brands/stilnest",
    //             icon: Tag01,
    //         },
    //         {
    //             label: "Kuzzoi",
    //             href: "/brands/kuzzoi",
    //             icon: Tag01,
    //         },
    //         {
    //             label: "Haze and Glory",
    //             href: "/brands/haze-and-glory",
    //             icon: Tag01,
    //         },
    //         {
    //             label: "Samapura",
    //             href: "/brands/samapura",
    //             icon: Tag01,
    //         },
    //     ],
    // },
];

export const SidebarNavigationSectionsSubheadingsDemo = () => (
    <SidebarNavigationSectionsSubheadings 
        activeUrl="/" 
        items={navItemsWithSectionsSubheadings} 
    />
);

export { navItemsWithSectionsSubheadings };
