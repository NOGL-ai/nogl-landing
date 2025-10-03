"use client";

import React, { useState } from "react";
import CatalogHeader from "../atoms/CatalogHeader";
import UltimateProductTable, {
	Product,
} from "../organisms/UltimateProductTable";
import { createApiDataFetcher } from "@/utils/infiniteScrollUtils";

const CatalogContent = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false);

	// German jewelry brands data from Shopify stores
	const products = [
		{
			id: "1",
			name: "Halskette Geo",
			sku: "0201493117_16",
			image:
				"https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903",
			cost: "-",
			price: "€ 49.90",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Ellijewelry",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 45.90",
				avg: "€ 52.30",
				highest: "€ 58.90",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "2",
			name: "Armband Geo",
			sku: "0201493117_16",
			image:
				"https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903",
			cost: "-",
			price: "€ 69.90",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Ellijewelry",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 65.90",
				avg: "€ 72.50",
				highest: "€ 79.90",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "3",
			name: "Anhänger | Süßwasserperle",
			sku: "726061-042",
			image:
				"https://cdn.shopify.com/s/files/1/0754/3170/6907/files/80418-image-squared-1-1642483170_ea9381cc-5ded-4e43-936a-d95edd786ede.jpg?v=1753813240",
			cost: "-",
			price: "€ 99.00",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Nenalina",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 89.90",
				avg: "€ 105.50",
				highest: "€ 119.90",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "4",
			name: "Halskette Feder",
			sku: "0103342725_50",
			image:
				"https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92563-image-squared-1-1744873272.jpg?v=1746632949",
			cost: "-",
			price: "€ 49.90",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Kuzzoi",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 45.90",
				avg: "€ 52.30",
				highest: "€ 58.90",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "5",
			name: "Siegelring Quadrat",
			sku: "0603732725_62",
			image:
				"https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92553-image-squared-1-1743745897.jpg?v=1746632953",
			cost: "-",
			price: "€ 69.90",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Kuzzoi",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 65.90",
				avg: "€ 72.50",
				highest: "€ 79.90",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "6",
			name: "Ohrstecker Quadrat | Zirkonia",
			sku: "0303152725",
			image:
				"https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92562-image-squared-1-1744878360.jpg?v=1746632950",
			cost: "-",
			price: "€ 39.90",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Kuzzoi",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 35.90",
				avg: "€ 42.30",
				highest: "€ 48.90",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "7",
			name: "Zodiac Birthstone Ring 24k Gold",
			sku: "0604181025_49",
			image:
				"https://cdn.shopify.com/s/files/1/0016/4380/6833/files/VERMIL_GIF_BIRTHSTONES_2025_46d08e6a-0bcd-41f2-bd14-25c7356ea3f6.gif?v=1747302625",
			cost: "-",
			price: "€ 120.00",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Stilnest",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 110.00",
				avg: "€ 125.50",
				highest: "€ 140.00",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "8",
			name: "Zodiac Birthstone Ring 925 Silber",
			sku: "0604871025_49",
			image:
				"https://cdn.shopify.com/s/files/1/0016/4380/6833/files/Virgo_sn-10048150-66-v_Main_Default_Up.jpg?v=1747302625",
			cost: "-",
			price: "€ 120.00",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Stilnest",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 110.00",
				avg: "€ 125.50",
				highest: "€ 140.00",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "9",
			name: "Grüner Quarz Drop Double Ring",
			sku: "0612752424_49",
			image:
				"https://cdn.shopify.com/s/files/1/0016/4380/6833/files/Drop-Double-Ring_Green-Quartz_Vermeil_02.jpg?v=1737530673",
			cost: "-",
			price: "€ 150.00",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Stilnest",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 135.00",
				avg: "€ 155.50",
				highest: "€ 175.00",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
		{
			id: "10",
			name: "Roter Granat Drop Double Ring",
			sku: "0612132424_49",
			image:
				"https://cdn.shopify.com/s/files/1/0016/4380/6833/files/Drop-Double-Ring_Red-Garnet_Vermeil_02.jpg?v=1737467551",
			cost: "-",
			price: "€ 150.00",
			minPrice: "-",
			maxPrice: "-",
			currency: "EUR",
			channel: "shopify",
			brand: {
				name: "Stilnest",
				logo: "/api/placeholder/24/24",
			},
			competitors: {
				cheapest: "€ 135.00",
				avg: "€ 155.50",
				highest: "€ 175.00",
				cheapestColor: "green" as const,
			},
			triggeredRule: "price optimization active",
		},
	];

	// Infinite scroll configuration
	const infiniteScrollProps = {
		queryKey: ["products"] as (string | number | boolean)[],
		queryFn: createApiDataFetcher<Product>("/api/products", 20),
		fetchSize: 20,
	};

	const handleInfiniteScrollToggle = (enabled: boolean) => {
		setEnableInfiniteScroll(enabled);
	};

	return (
		<div className='w-full space-y-6 px-4 py-6 transition-all duration-300 lg:px-6'>
			<CatalogHeader productCount={products.length} />

			<UltimateProductTable
				products={products}
				enableInfiniteScroll={enableInfiniteScroll}
				onInfiniteScrollToggle={handleInfiniteScrollToggle}
				infiniteScrollProps={infiniteScrollProps}
			/>
		</div>
	);
};

export default CatalogContent;
