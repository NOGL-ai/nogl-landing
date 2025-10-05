"use client";

import React from "react";
import { ProductDataTable } from "@/components/organisms/tables/ProductDataTable";

// Sample data for testing
const sampleProducts = [
  {
    id: "1",
    name: "Gold Ring",
    sku: "GR001",
    image: "https://via.placeholder.com/100x100",
    productUrl: "/products/gold-ring",
    cost: "50.00",
    price: "120.00",
    currency: "EUR",
    minPrice: "100.00",
    maxPrice: "150.00",
    brand: {
      name: "Stilnest",
      logo: "https://via.placeholder.com/20x20",
    },
    competitors: {
      cheapest: "110.00",
      avg: "125.00",
      highest: "140.00",
      cheapestColor: "green" as const,
    },
    triggeredRule: "active",
    channel: "shopify",
    category: "Rings",
    status: "active" as const,
    featured: true,
    margin: 70,
    stock: 10,
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "Silver Necklace",
    sku: "SN002",
    image: "https://via.placeholder.com/100x100",
    productUrl: "/products/silver-necklace",
    cost: "30.00",
    price: "80.00",
    currency: "EUR",
    minPrice: "70.00",
    maxPrice: "90.00",
    brand: {
      name: "Ellijewelry",
      logo: "https://via.placeholder.com/20x20",
    },
    competitors: {
      cheapest: "75.00",
      avg: "82.00",
      highest: "88.00",
      cheapestColor: "red" as const,
    },
    triggeredRule: "inactive",
    channel: "woocommerce",
    category: "Necklaces",
    status: "active" as const,
    featured: false,
    margin: 50,
    stock: 5,
    lastUpdated: "2024-01-14",
  },
];

export default function TestTablePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Test Product Data Table</h1>
      <p className="text-gray-600 mb-6">
        This page tests the new modular ProductDataTable component with Untitled UI design system.
      </p>
      
      <ProductDataTable 
        products={sampleProducts}
        enableInfiniteScroll={false}
      />
    </div>
  );
}
