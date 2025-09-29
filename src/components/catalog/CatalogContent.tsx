'use client';

import React, { useState } from 'react';
import CatalogHeader from './CatalogHeader';
import ProductTable from './ProductTable';
import EnhancedProductTable from './EnhancedProductTable';
import AdvancedProductTable from './AdvancedProductTable';
import CatalogPagination from './CatalogPagination';

const CatalogContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(57);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [tableType, setTableType] = useState<'advanced' | 'enhanced' | 'original'>('advanced');

  // German jewelry brands data from Shopify stores
  const products = [
    {
      id: '1',
      name: 'Halskette Geo',
      sku: '0201493117_16',
      image: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903',
      cost: '-',
      price: '€ 49.90',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Ellijewelry',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 45.90',
        avg: '€ 52.30',
        highest: '€ 58.90',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '2',
      name: 'Armband Geo',
      sku: '0201493117_16',
      image: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903',
      cost: '-',
      price: '€ 69.90',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Ellijewelry',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 65.90',
        avg: '€ 72.50',
        highest: '€ 79.90',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '3',
      name: 'Anhänger | Süßwasserperle',
      sku: '726061-042',
      image: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/80418-image-squared-1-1642483170_ea9381cc-5ded-4e43-936a-d95edd786ede.jpg?v=1753813240',
      cost: '-',
      price: '€ 99.00',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Nenalina',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 89.90',
        avg: '€ 105.50',
        highest: '€ 119.90',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '4',
      name: 'Halskette Feder',
      sku: '0103342725_50',
      image: 'https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92563-image-squared-1-1744873272.jpg?v=1746632949',
      cost: '-',
      price: '€ 49.90',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Kuzzoi',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 45.90',
        avg: '€ 52.30',
        highest: '€ 58.90',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '5',
      name: 'Siegelring Quadrat',
      sku: '0603732725_62',
      image: 'https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92553-image-squared-1-1743745897.jpg?v=1746632953',
      cost: '-',
      price: '€ 69.90',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Kuzzoi',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 65.90',
        avg: '€ 72.50',
        highest: '€ 79.90',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '6',
      name: 'Ohrstecker Quadrat | Zirkonia',
      sku: '0303152725',
      image: 'https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92562-image-squared-1-1744878360.jpg?v=1746632950',
      cost: '-',
      price: '€ 39.90',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Kuzzoi',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 35.90',
        avg: '€ 42.30',
        highest: '€ 48.90',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '7',
      name: 'Zodiac Birthstone Ring 24k Gold',
      sku: '0604181025_49',
      image: 'https://cdn.shopify.com/s/files/1/0016/4380/6833/files/VERMIL_GIF_BIRTHSTONES_2025_46d08e6a-0bcd-41f2-bd14-25c7356ea3f6.gif?v=1747302625',
      cost: '-',
      price: '€ 120.00',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Stilnest',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 110.00',
        avg: '€ 125.50',
        highest: '€ 140.00',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '8',
      name: 'Zodiac Birthstone Ring 925 Silber',
      sku: '0604871025_49',
      image: 'https://cdn.shopify.com/s/files/1/0016/4380/6833/files/Virgo_sn-10048150-66-v_Main_Default_Up.jpg?v=1747302625',
      cost: '-',
      price: '€ 120.00',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Stilnest',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 110.00',
        avg: '€ 125.50',
        highest: '€ 140.00',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '9',
      name: 'Grüner Quarz Drop Double Ring',
      sku: '0612752424_49',
      image: 'https://cdn.shopify.com/s/files/1/0016/4380/6833/files/Drop-Double-Ring_Green-Quartz_Vermeil_02.jpg?v=1737530673',
      cost: '-',
      price: '€ 150.00',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Stilnest',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 135.00',
        avg: '€ 155.50',
        highest: '€ 175.00',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    },
    {
      id: '10',
      name: 'Roter Granat Drop Double Ring',
      sku: '0612132424_49',
      image: 'https://cdn.shopify.com/s/files/1/0016/4380/6833/files/Drop-Double-Ring_Red-Garnet_Vermeil_02.jpg?v=1737467551',
      cost: '-',
      price: '€ 150.00',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Stilnest',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 135.00',
        avg: '€ 155.50',
        highest: '€ 175.00',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'price optimization active'
    }
  ];

  const handleProductSelect = (productId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6 transition-all duration-300">
      <CatalogHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        productCount={products.length}
      />
      
      {/* Table Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTableType('advanced')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              tableType === 'advanced'
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🚀 Advanced Table
          </button>
          <button
            onClick={() => setTableType('enhanced')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              tableType === 'enhanced'
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Enhanced Table
          </button>
          <button
            onClick={() => setTableType('original')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              tableType === 'original'
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Original Table
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {tableType === 'advanced' && '🏆 Best Performance + Features'}
          {tableType === 'enhanced' && 'Powered by TanStack Table'}
          {tableType === 'original' && 'Custom Implementation'}
        </div>
      </div>
      
      {tableType === 'advanced' ? (
        <AdvancedProductTable products={products} />
      ) : tableType === 'enhanced' ? (
        <EnhancedProductTable products={products} />
      ) : (
        <>
          <ProductTable 
            products={products}
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            onSelectAll={handleSelectAll}
          />
          
          <CatalogPagination 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default CatalogContent;
