import __taxonomies from "./jsons/__taxonomies.json";
import __stayTaxonomies from "./jsons/__stayTaxonomies.json";
import __experiencesTaxonomies from "./jsons/__experiencesTaxonomies.json";
import { TaxonomyType } from "./types";
import { Route } from "@/routers/types";

const DEMO_CATEGORIES: TaxonomyType[] = __taxonomies.map((item) => ({
	...item,
	id: item.id.toString(),
	taxonomy: "category",
	href: item.href as Route<string>,
}));

const DEMO_TAGS: TaxonomyType[] = __taxonomies.map((item) => ({
	...item,
	id: item.id.toString(),
	taxonomy: "tag",
	href: item.href as Route<string>,
}));

// Stay categories
const DEMO_STAY_CATEGORIES: TaxonomyType[] = __stayTaxonomies.map((item) => ({
	...item,
	id: item.id.toString(),
	taxonomy: "category",
	href: item.href as Route<string>,
}));

// Experience categories
const DEMO_EXPERIENCES_CATEGORIES: TaxonomyType[] = __experiencesTaxonomies.map(
	(item) => ({
		...item,
		id: item.id.toString(),
		taxonomy: "category",
		href: item.href as Route<string>,
	})
);

// Session categories - removed due to deleted listing files
// const DEMO_SESSION_CATEGORIES: TaxonomyType[] = [];

// Session types - removed due to deleted listing files  
// const DEMO_SESSION_TYPES: TaxonomyType[] = [];

// Expert categories - removed due to deleted listing files
// const DEMO_EXPERT_CATEGORIES: TaxonomyType[] = [];

// Expert types - removed due to deleted listing files
// const DEMO_EXPERT_TYPES: TaxonomyType[] = [];


export {
	DEMO_CATEGORIES,
	DEMO_TAGS,
	DEMO_STAY_CATEGORIES,
	DEMO_EXPERIENCES_CATEGORIES,
	// DEMO_SESSION_CATEGORIES, // Removed due to deleted listing files
	// DEMO_SESSION_TYPES, // Removed due to deleted listing files
	// DEMO_EXPERT_CATEGORIES, // Removed due to deleted listing files
	// DEMO_EXPERT_TYPES, // Removed due to deleted listing files
};
