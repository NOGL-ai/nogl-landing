'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
}

interface CompetitorPrices {
  cheapest: number;
  average: number;
  highest: number;
}

interface RepricingData {
  product: Product;
  currentPrice: number;
  cost: number;
  markup: {
    amount: number;
    percentage: number;
  };
  newPrice: {
    oldPrice: number;
    newPrice: number;
    changePercentage: number;
    canReprice: boolean;
  };
  minMaxPrice: {
    min: number | null;
    max: number | null;
  };
  competitorPrices: CompetitorPrices | null;
  triggeredRule: string;
  priceColor: 'red' | 'green' | 'normal';
}

const mockData: RepricingData[] = [
  {
    product: {
      id: '1',
      name: 'Blue Jeans',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32'
    },
    currentPrice: 24.00,
    cost: 0.00,
    markup: { amount: 24.00, percentage: 100 },
    newPrice: {
      oldPrice: 63.98,
      newPrice: 13.98,
      changePercentage: -42,
      canReprice: true
    },
    minMaxPrice: { min: null, max: null },
    competitorPrices: {
      cheapest: 13.98,
      average: 13.98,
      highest: 13.98
    },
    triggeredRule: 'test new price adjust',
    priceColor: 'red'
  },
  {
    product: {
      id: '2',
      name: 'Graphic print T-shirt',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32'
    },
    currentPrice: 50.00,
    cost: 0.00,
    markup: { amount: 50.00, percentage: 100 },
    newPrice: {
      oldPrice: 63.98,
      newPrice: 13.98,
      changePercentage: -42,
      canReprice: true
    },
    minMaxPrice: { min: null, max: null },
    competitorPrices: {
      cheapest: 13.98,
      average: 13.98,
      highest: 13.98
    },
    triggeredRule: 'test new price adjust',
    priceColor: 'red'
  },
  {
    product: {
      id: '3',
      name: 'Trousers',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32'
    },
    currentPrice: 12.00,
    cost: 0.00,
    markup: { amount: 12.00, percentage: 100 },
    newPrice: {
      oldPrice: 63.98,
      newPrice: 13.98,
      changePercentage: 16.5,
      canReprice: true
    },
    minMaxPrice: { min: null, max: null },
    competitorPrices: {
      cheapest: 13.98,
      average: 565.03,
      highest: 13.98
    },
    triggeredRule: 'test new price adjust',
    priceColor: 'green'
  },
  {
    product: {
      id: '4',
      name: 'Leather biker jacket',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32'
    },
    currentPrice: 699.95,
    cost: 0.00,
    markup: { amount: 699.95, percentage: 100 },
    newPrice: {
      oldPrice: 63.98,
      newPrice: 13.98,
      changePercentage: -98,
      canReprice: true
    },
    minMaxPrice: { min: null, max: null },
    competitorPrices: {
      cheapest: 13.98,
      average: 13.98,
      highest: 13.98
    },
    triggeredRule: 'test new price adjust',
    priceColor: 'red'
  },
  {
    product: {
      id: '5',
      name: 'Sporty bomber jacket',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32'
    },
    currentPrice: 50.95,
    cost: 0.00,
    markup: { amount: 50.00, percentage: 100 },
    newPrice: {
      oldPrice: 0,
      newPrice: 0,
      changePercentage: 0,
      canReprice: false
    },
    minMaxPrice: { min: null, max: null },
    competitorPrices: null,
    triggeredRule: 'test new price adjust',
    priceColor: 'normal'
  },
  {
    product: {
      id: '6',
      name: 'Button-up shirt',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32'
    },
    currentPrice: 20.95,
    cost: 0.00,
    markup: { amount: 20.00, percentage: 100 },
    newPrice: {
      oldPrice: 0,
      newPrice: 0,
      changePercentage: 0,
      canReprice: false
    },
    minMaxPrice: { min: null, max: null },
    competitorPrices: null,
    triggeredRule: 'test new price adjust',
    priceColor: 'normal'
  },
  {
    product: {
      id: '7',
      name: 'Polo shirt',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32'
    },
    currentPrice: 20.95,
    cost: 0.00,
    markup: { amount: 20.00, percentage: 100 },
    newPrice: {
      oldPrice: 0,
      newPrice: 0,
      changePercentage: 0,
      canReprice: false
    },
    minMaxPrice: { min: null, max: null },
    competitorPrices: null,
    triggeredRule: 'test new price adjust',
    priceColor: 'normal'
  },
  {
    product: {
      id: '8',
      name: 'Polo shirt',
      sku: 'tshirt-test-demo1',
      image: '/api/placeholder/32/32'
    },
    currentPrice: 20.95,
    cost: 0.00,
    markup: { amount: 20.00, percentage: 100 },
    newPrice: {
      oldPrice: 0,
      newPrice: 0,
      changePercentage: 0,
      canReprice: false
    },
    minMaxPrice: { min: null, max: null },
    competitorPrices: null,
    triggeredRule: 'test new price adjust',
    priceColor: 'normal'
  }
];

export const RepricingPreview: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(57);

  const handleSelectAll = () => {
    if (selectedItems.size === mockData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(mockData.map(item => item.product.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const CheckboxComponent = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={`w-4 h-4 rounded border ${
          checked 
            ? 'bg-primary-500 border-primary-500' 
            : 'bg-white border-[#DEE0E3]'
        } shadow-sm cursor-pointer`}
        onClick={onChange}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white absolute top-0.5 left-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
  );

  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.25 2.5C12.976 2.5 16 5.524 16 9.25C16 12.976 12.976 16 9.25 16C5.524 16 2.5 12.976 2.5 9.25C2.5 5.524 5.524 2.5 9.25 2.5ZM9.25 14.5C12.1502 14.5 14.5 12.1502 14.5 9.25C14.5 6.349 12.1502 4 9.25 4C6.349 4 4 6.349 4 9.25C4 12.1502 6.349 14.5 9.25 14.5ZM15.6137 14.5532L17.7355 16.6742L16.6742 17.7355L14.5532 15.6137L15.6137 14.5532Z" fill="#868C98"/>
    </svg>
  );

  const FilterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="#54565B"/>
    </svg>
  );

  const ArrowDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0001 10.879L13.7126 7.1665L14.7731 8.227L10.0001 13L5.22705 8.227L6.28755 7.1665L10.0001 10.879Z" fill="#525866"/>
    </svg>
  );

  const MoneyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 14C4.6862 14 2 11.3138 2 8C2 4.6862 4.6862 2 8 2C11.3138 2 14 4.6862 14 8C14 11.3138 11.3138 14 8 14ZM8 12.8C9.27304 12.8 10.4939 12.2943 11.3941 11.3941C12.2943 10.4939 12.8 9.27304 12.8 8C12.8 6.72696 12.2943 5.50606 11.3941 4.60589C10.4939 3.70571 9.27304 3.2 8 3.2C6.72696 3.2 5.50606 3.70571 4.60589 4.60589C3.70571 5.50606 3.2 6.72696 3.2 8C3.2 9.27304 3.70571 10.4939 4.60589 11.3941C5.50606 12.2943 6.72696 12.8 8 12.8ZM5.9 9.2H9.2C9.27957 9.2 9.35587 9.16839 9.41213 9.11213C9.46839 9.05587 9.5 8.97957 9.5 8.9C9.5 8.82044 9.46839 8.74413 9.41213 8.68787C9.35587 8.63161 9.27957 8.6 9.2 8.6H6.8C6.40218 8.6 6.02064 8.44197 5.73934 8.16066C5.45804 7.87936 5.3 7.49783 5.3 7.1C5.3 6.70218 5.45804 6.32064 5.73934 6.03934C6.02064 5.75804 6.40218 5.6 6.8 5.6H7.4V4.4H8.6V5.6H10.1V6.8H6.8C6.72044 6.8 6.64413 6.83161 6.58787 6.88787C6.53161 6.94413 6.5 7.02044 6.5 7.1C6.5 7.17956 6.53161 7.25587 6.58787 7.31213C6.64413 7.36839 6.72044 7.4 6.8 7.4H9.2C9.59783 7.4 9.97936 7.55804 10.2607 7.83934C10.542 8.12064 10.7 8.50218 10.7 8.9C10.7 9.29782 10.542 9.67936 10.2607 9.96066C9.97936 10.242 9.59783 10.4 9.2 10.4H8.6V11.6H7.4V10.4H5.9V9.2Z" fill="#0E121B"/>
    </svg>
  );

  const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5235 9.1664H16.6668V10.8331H6.5235L10.9935 15.3031L9.81516 16.4814L3.3335 9.99973L9.81516 3.51807L10.9935 4.6964L6.5235 9.1664Z" fill="#0F1324" fillOpacity="0.6"/>
    </svg>
  );

  const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.4768 9.1664L9.00683 4.6964L10.1852 3.51807L16.6668 9.99973L10.1852 16.4814L9.00683 15.3031L13.4768 10.8331H3.3335V9.1664H13.4768Z" fill="#0F1324" fillOpacity="0.6"/>
    </svg>
  );

  const formatPrice = (price: number): string => {
    return `€ ${price.toFixed(2)}`;
  };

  const getPriceColor = (priceColor: 'red' | 'green' | 'normal'): string => {
    switch (priceColor) {
      case 'red':
        return '#F05252';
      case 'green':
        return '#1FC16B';
      default:
        return '#0E121B';
    }
  };

  return (
    <div className="w-full bg-gray-3 p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start gap-3 bg-white rounded-xl border border-[#F2F2F2] p-6 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-main-900 mb-1 leading-8 tracking-[-0.336px]">
              Repricing Preview
            </h1>
            <p className="text-sm text-text-sub-500 leading-5 tracking-[-0.07px]">
              See how the prices in your catalog would be repriced according to your repricing rules.
            </p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-[#DEE0E3]">
        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between p-3 border-b border-[#E9EAEC]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search a campaign..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[308px] h-9 pl-10 pr-3 py-2 text-sm border border-[#E2E4E9] rounded-lg bg-white shadow-sm placeholder-[#868C98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <SearchIcon />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-9 px-3 py-2 border border-[#E2E4E9] rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors">
              <FilterIcon />
              <span className="text-sm font-medium text-[#54565B]">Filter</span>
            </button>
            
            <button className="flex items-center gap-2 h-9 px-3 py-2 border border-[#E2E4E9] rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-[#54565B]">Massive Actions</span>
              <ArrowDownIcon />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <div className="flex">
            {/* Product Name Column */}
            <div className="w-60 flex flex-col">
              <div className="h-10 bg-[#F7F7F8] border-b border-[#E9EAEC] flex items-center px-3 gap-3">
                <CheckboxComponent
                  checked={selectedItems.size === mockData.length}
                  onChange={handleSelectAll}
                />
                <span className="text-xs text-[#525866] font-normal leading-5 tracking-[-0.06px]">
                  Product Name
                </span>
              </div>
              {mockData.map((item) => (
                <div key={item.product.id} className="h-[88px] bg-white border-b border-[#E9EAEC] flex items-center px-3 gap-3">
                  <CheckboxComponent
                    checked={selectedItems.has(item.product.id)}
                    onChange={() => handleSelectItem(item.product.id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className="text-xs font-medium text-[#0E121B] leading-5 tracking-[-0.06px]">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-[#525866] leading-4">
                        SKU: {item.product.sku}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Column */}
            <div className="w-[86px] flex flex-col">
              <div className="h-10 bg-[#F7F7F8] border-b border-[#E9EAEC] flex items-center px-3">
                <span className="text-xs text-[#525866] font-normal leading-5 tracking-[-0.06px]">
                  Price
                </span>
              </div>
              {mockData.map((item) => (
                <div key={item.product.id} className="h-[88px] bg-white border-b border-[#E9EAEC] flex items-center px-3">
                  <span
                    className="text-xs font-normal leading-5 tracking-[-0.06px] flex-1"
                    style={{ color: getPriceColor(item.priceColor) }}
                  >
                    {formatPrice(item.currentPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Column */}
            <div className="w-[86px] flex flex-col">
              <div className="h-10 bg-[#F7F7F8] border-b border-[#E9EAEC] flex items-center px-3">
                <span className="text-xs text-[#525866] font-normal leading-5 tracking-[-0.06px]">
                  Cost
                </span>
              </div>
              {mockData.map((item) => (
                <div key={item.product.id} className="h-[88px] bg-white border-b border-[#E9EAEC] flex items-center px-3">
                  <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] flex-1">
                    {formatPrice(item.cost)}
                  </span>
                </div>
              ))}
            </div>

            {/* Markup Column */}
            <div className="w-[130px] flex flex-col">
              <div className="h-10 bg-[#F7F7F8] border-b border-[#E9EAEC] flex items-center px-3">
                <span className="text-xs text-[#525866] font-normal leading-5 tracking-[-0.06px]">
                  Markup
                </span>
              </div>
              {mockData.map((item) => (
                <div key={item.product.id} className="h-[88px] bg-white border-b border-[#E9EAEC] flex items-center px-3">
                  <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] flex-1">
                    {formatPrice(item.markup.amount)} ({item.markup.percentage}%)
                  </span>
                </div>
              ))}
            </div>

            {/* New Price Column */}
            <div className="w-[180px] flex flex-col">
              <div className="h-10 bg-[#F7F7F8] border-b border-[#E9EAEC] flex items-center px-3">
                <span className="text-xs text-[#525866] font-normal leading-5 tracking-[-0.06px]">
                  New Price
                </span>
              </div>
              {mockData.map((item) => (
                <div key={item.product.id} className="h-[88px] bg-white border-b border-[#E9EAEC] flex flex-col justify-center px-3 gap-0.5">
                  {item.newPrice.canReprice ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#6C6E79] line-through leading-5 tracking-[-0.06px]">
                          {formatPrice(item.newPrice.oldPrice)}
                        </span>
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                          {formatPrice(item.newPrice.newPrice)}
                        </span>
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                          ({item.newPrice.changePercentage > 0 ? '+' : ''}{item.newPrice.changePercentage}%)
                        </span>
                      </div>
                      <button className="text-xs text-[#375DFB] font-normal leading-5 tracking-[-0.06px] text-left hover:underline">
                        Reprice Now
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-[#6C6E79] line-through leading-5 tracking-[-0.06px]">
                      -
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Min/Max Price Column */}
            <div className="w-[152px] flex flex-col">
              <div className="h-10 bg-[#F7F7F8] border-b border-[#E9EAEC] flex items-center px-3">
                <span className="text-xs text-[#525866] font-normal leading-5 tracking-[-0.06px]">
                  Min/Max Price
                </span>
              </div>
              {mockData.map((item) => (
                <div key={item.product.id} className="h-[88px] bg-white border-b border-[#E9EAEC] flex flex-col justify-center px-3 gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                      Min Price:
                    </span>
                    <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] text-right">
                      {item.minMaxPrice.min ? formatPrice(item.minMaxPrice.min) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                      Max Price:
                    </span>
                    <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] text-right">
                      {item.minMaxPrice.max ? formatPrice(item.minMaxPrice.max) : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Competitors Prices Column */}
            <div className="w-[212px] flex flex-col">
              <div className="h-10 bg-[#F7F7F8] border-b border-[#E9EAEC] flex items-center px-3">
                <span className="text-xs text-[#525866] font-normal leading-5 tracking-[-0.06px]">
                  Competitors Prices
                </span>
              </div>
              {mockData.map((item) => (
                <div key={item.product.id} className="h-[88px] bg-white border-b border-[#E9EAEC] flex flex-col justify-center px-3 gap-0.5">
                  {item.competitorPrices ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                          Cheapest Price:
                        </span>
                        <span className="text-xs text-[#0E9F6E] font-normal leading-5 tracking-[-0.06px] text-right w-14">
                          {formatPrice(item.competitorPrices.cheapest)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                          Avg Price:
                        </span>
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] text-right w-14">
                          {formatPrice(item.competitorPrices.average)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                          Highest Price:
                        </span>
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] text-right w-14">
                          {formatPrice(item.competitorPrices.highest)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                          Cheapest Price:
                        </span>
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] text-right w-14">
                          -
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                          Avg Price:
                        </span>
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] text-right w-14">
                          -
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px]">
                          Highest Price:
                        </span>
                        <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] text-right w-14">
                          -
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Triggered Rule Column */}
            <div className="w-[182px] flex flex-col">
              <div className="h-10 bg-[#F7F7F8] border-b border-[#E9EAEC] flex items-center px-3">
                <span className="text-xs text-[#525866] font-normal leading-5 tracking-[-0.06px]">
                  Triggered Rule
                </span>
              </div>
              {mockData.map((item) => (
                <div key={item.product.id} className="h-[88px] bg-white border-b border-[#E9EAEC] flex items-center px-3 gap-2">
                  <MoneyIcon />
                  <span className="text-xs text-[#0E121B] font-normal leading-5 tracking-[-0.06px] flex-1">
                    {item.triggeredRule}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-5 px-6">
          <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-transparent hover:bg-gray-50 transition-colors">
            <ArrowLeftIcon />
          </button>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium text-[#0F1324] opacity-60">
            1
          </button>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium text-[#0F1324] opacity-60">
            ...
          </button>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium text-[#0F1324] opacity-60">
            56
          </button>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-sm font-medium text-[#14151A] shadow-sm border border-gray-200">
            57
          </button>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium text-[#0F1324] opacity-60">
            58
          </button>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium text-[#0F1324] opacity-60">
            ...
          </button>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium text-[#0F1324] opacity-60">
            100
          </button>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-transparent hover:bg-gray-50 transition-colors">
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepricingPreview;
