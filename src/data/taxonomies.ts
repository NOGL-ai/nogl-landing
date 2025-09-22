import __taxonomies from "./jsons/__taxonomies.json";
import __stayTaxonomies from "./jsons/__stayTaxonomies.json";
import __experiencesTaxonomies from "./jsons/__experiencesTaxonomies.json";
import __sessionsListing from "./jsons/__sessionsListing.json";
import __expertsListing from "./jsons/__expertsListing.json"; // Added experts listing
import { TaxonomyType } from "./types";
import { Route } from "@/routers/types";

const DEMO_CATEGORIES: TaxonomyType[] = __taxonomies.map((item) => ({
	...item,
	taxonomy: "category",
	href: item.href as Route,
}));

const DEMO_TAGS: TaxonomyType[] = __taxonomies.map((item) => ({
	...item,
	taxonomy: "tag",
	href: item.href as Route,
}));

// Stay categories
const DEMO_STAY_CATEGORIES: TaxonomyType[] = __stayTaxonomies.map((item) => ({
	...item,
	taxonomy: "category",
	listingType: "stay",
	href: item.href as Route,
}));

// Experience categories
const DEMO_EXPERIENCES_CATEGORIES: TaxonomyType[] = __experiencesTaxonomies.map(
	(item) => ({
		...item,
		taxonomy: "category",
		listingType: "experiences",
		href: item.href as Route,
	})
);

// Session categories
const DEMO_SESSION_CATEGORIES: TaxonomyType[] = __sessionsListing.map((item) => ({
	id: item.id,
	name: item.categoryName,
	href: item.href as Route,
	taxonomy: "category",
	listingType: "sessions",
}));

// Session types
const DEMO_SESSION_TYPES: TaxonomyType[] = __sessionsListing.map((item) => ({
	id: item.id,
	name: item.sessionType,
	href: item.href as Route,
	taxonomy: "type", // Recognizes "type" as a valid taxonomy
	listingType: "sessions",
}));

// Expert categories
const DEMO_EXPERT_CATEGORIES: TaxonomyType[] = __expertsListing.map((item) => ({
	id: item.id,
	name: item.categoryName,  // This exists in your JSON
	href: item.href as Route,
	taxonomy: "category",
	listingType: "experts",  // New listing type for experts
}));

// Expert types (using sessionType instead of expertType)
const DEMO_EXPERT_TYPES: TaxonomyType[] = __expertsListing.map((item) => ({
	id: item.id,
	name: item.sessionType,  // Use sessionType from your JSON
	href: item.href as Route,
	taxonomy: "type",  // Recognizes "type" as a valid taxonomy
	listingType: "experts",
}));


export {
	DEMO_CATEGORIES,
	DEMO_TAGS,
	DEMO_STAY_CATEGORIES,
	DEMO_EXPERIENCES_CATEGORIES,
	DEMO_SESSION_CATEGORIES,
	DEMO_SESSION_TYPES,
	DEMO_EXPERT_CATEGORIES, // Exported expert categories
	DEMO_EXPERT_TYPES, // Exported expert types
};
