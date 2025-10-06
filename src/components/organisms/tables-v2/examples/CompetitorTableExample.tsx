"use client";

import React from "react";
import { CompetitorTable, type Competitor } from "../domains/competitors";

// Sample competitor data
const sampleCompetitors: Competitor[] = [
  {
    id: 0,
    name: 'Ephemeral',
    domain: 'ephemeral.io',
    avatar: '/api/placeholder/40/40',
    products: 1250,
    position: 60,
    trend: 5,
    trendUp: true,
    date: '22 Jan 2025',
    categories: ['Active', 'In Stock', 'Customer data', '+3'],
    competitorPrice: 29.90,
    myPrice: 42.00,
  },
  {
    id: 1,
    name: 'Stack3d Lab',
    domain: 'stack3dlab.com',
    avatar: '/api/placeholder/40/40',
    products: 980,
    position: 72,
    trend: 4,
    trendUp: false,
    date: '20 Jan 2025',
    categories: ['Active', 'In Stock', 'Business data', '+3'],
    competitorPrice: 35.50,
    myPrice: 32.00,
  },
  {
    id: 2,
    name: 'Warpspeed',
    domain: 'getwarpspeed.com',
    avatar: '/api/placeholder/40/40',
    products: 113,
    position: 78,
    trend: 6,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'In Stock', 'Customer data'],
    competitorPrice: 45.00,
    myPrice: 45.00,
  },
];

export function CompetitorTableExample() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Competitor Table Example</h1>
      <p className="text-gray-600 mb-6">
        This example shows how to use the new reusable CompetitorTable component.
      </p>
      
      <CompetitorTable
        competitors={sampleCompetitors}
        variant="untitled-ui"
        tableTitle="Competitor Monitoring"
        tableBadge={<span className="text-xs font-medium text-blue-600">7 competitors</span>}
        tableDescription="Monitor competitor pricing and stay competitive with real-time price tracking."
        enableSelection={true}
        enableGlobalSearch={true}
        enableColumnManagement={true}
        onRowSelectionChange={(selectedRows) => {
          console.log('Selected competitors:', selectedRows);
        }}
      />
    </div>
  );
}
