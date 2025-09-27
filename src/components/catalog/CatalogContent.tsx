'use client';

import React, { useState } from 'react';
import CatalogHeader from './CatalogHeader';
import ProductTable from './ProductTable';
import CatalogPagination from './CatalogPagination';

const CatalogContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(57);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Mock data - in real app this would come from API/database
  const products = [
    {
      id: '1',
      name: 'Blue Jeans',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32',
      cost: '-',
      price: '€ 45.19',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Energizer',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 13.98',
        avg: '€ 13.98',
        highest: '€ 13.98',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'test new price adjust'
    },
    {
      id: '2',
      name: 'Graphic print T-shirt',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32',
      cost: '-',
      price: '€ 13.98',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Apple',
        logo: null // Will use Apple icon
      },
      competitors: {
        cheapest: '€ 13.98',
        avg: '€ 13.98',
        highest: '€ 13.98',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'test new price adjust'
    },
    {
      id: '3',
      name: 'Trousers',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32',
      cost: '-',
      price: '€ 25.59',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Borz',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 13.98',
        avg: '€ 565.03',
        highest: '€ 13.98',
        cheapestColor: 'red' as const
      },
      triggeredRule: 'test new price adjust'
    },
    {
      id: '4',
      name: 'Leather biker jacket',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32',
      cost: '-',
      price: '€ 24.39',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Lightahead',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '€ 13.98',
        avg: '€ 13.98',
        highest: '€ 13.98',
        cheapestColor: 'green' as const
      },
      triggeredRule: 'test new price adjust'
    },
    {
      id: '5',
      name: 'Sporty bomber jacket',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32',
      cost: '-',
      price: '€ 13.89',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Amazon',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '-',
        avg: '-',
        highest: '-',
        cheapestColor: 'gray' as const
      },
      triggeredRule: 'test new price adjust'
    },
    {
      id: '6',
      name: 'Button-up shirt',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32',
      cost: '-',
      price: '€ 16.49',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Ebay',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '-',
        avg: '-',
        highest: '-',
        cheapestColor: 'gray' as const
      },
      triggeredRule: 'test new price adjust'
    },
    {
      id: '7',
      name: 'Polo shirt',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32',
      cost: '-',
      price: '€ 16.99',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Etsy',
        logo: '/api/placeholder/24/24'
      },
      competitors: {
        cheapest: '-',
        avg: '-',
        highest: '-',
        cheapestColor: 'gray' as const
      },
      triggeredRule: 'test new price adjust'
    },
    {
      id: '8',
      name: 'Polo shirt',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32',
      cost: '-',
      price: '€ 20.98',
      minPrice: '-',
      maxPrice: '-',
      brand: {
        name: 'Shopify',
        logo: null // Will use Shopify icon
      },
      competitors: {
        cheapest: '-',
        avg: '-',
        highest: '-',
        cheapestColor: 'gray' as const
      },
      triggeredRule: 'test new price adjust'
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
    <div className="w-full h-full bg-gray-1 dark:bg-gray-900">
      <div className="w-full max-w-[1168px] mx-auto p-6">
        <CatalogHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          productCount={5}
        />
        
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
      </div>
    </div>
  );
};

export default CatalogContent;
