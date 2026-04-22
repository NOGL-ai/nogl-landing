/**
 * Demo product-type tree for the Taxonomy Explorer.
 * Replace or extend with Google Product Taxonomy CSV, Shopify taxonomy, or your own API.
 */
export type ProductTaxonomyNode = {
	id: string;
	name: string;
	children?: ProductTaxonomyNode[];
};

export const TAXONOMY_MAX_DEPTH = 5;

export const PRODUCT_TYPE_TAXONOMY_ROOTS: ProductTaxonomyNode[] = [
	{
		id: "apparel",
		name: "Apparel & Accessories",
		children: [
			{
				id: "apparel-shoes",
				name: "Shoes",
				children: [
					{
						id: "apparel-shoes-boots",
						name: "Boots",
						children: [
							{
								id: "apparel-shoes-boots-combat",
								name: "Combat Boots",
								children: [],
							},
						],
					},
				],
			},
		],
	},
	{
		id: "electronics",
		name: "Electronics",
		children: [
			{ id: "elec-audio", name: "Audio", children: [{ id: "elec-audio-speakers", name: "Speakers", children: [] }] },
			{ id: "elec-computers", name: "Computers", children: [{ id: "elec-computers-laptops", name: "Laptops", children: [] }] },
			{
				id: "elec-acc",
				name: "Electronics Accessories",
				children: [
					{ id: "elec-acc-gps", name: "GPS Accessories", children: [] },
					{ id: "elec-acc-gps-dev", name: "GPS Tracking Devices", children: [] },
				],
			},
			{
				id: "elec-video",
				name: "Video",
				children: [
					{
						id: "elec-video-acc",
						name: "Video Accessories",
						children: [
							{
								id: "elec-video-cables",
								name: "Video Cables",
								children: [
									{ id: "elec-video-hdmi", name: "HDMI Cables", children: [] },
									{ id: "elec-video-dvi", name: "DVI Cables", children: [] },
								],
							},
						],
					},
					{ id: "elec-video-console-acc", name: "Video Game Console Accessories", children: [] },
					{ id: "elec-video-consoles", name: "Video Game Consoles", children: [] },
				],
			},
		],
	},
	{
		id: "furniture",
		name: "Furniture",
		children: [{ id: "furniture-office", name: "Office Furniture", children: [] }],
	},
	{
		id: "health",
		name: "Health & Beauty",
		children: [{ id: "health-skincare", name: "Skin Care", children: [] }],
	},
	{
		id: "home",
		name: "Home & Garden",
		children: [{ id: "home-kitchen", name: "Kitchen & Dining", children: [] }],
	},
];

export function getChildren(path: ProductTaxonomyNode[]): ProductTaxonomyNode[] {
	if (path.length === 0) return PRODUCT_TYPE_TAXONOMY_ROOTS;
	const last = path[path.length - 1];
	return last.children ?? [];
}

export function formatPath(path: ProductTaxonomyNode[]): string {
	return path.map((n) => n.name).join(" > ");
}
