'use client';

import React from 'react';

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  cost: string;
  price: string;
  minPrice: string;
  maxPrice: string;
  brand: {
    name: string;
    logo: string | null;
  };
  competitors: {
    cheapest: string;
    avg: string;
    highest: string;
    cheapestColor: 'green' | 'red' | 'gray';
  };
  triggeredRule: string;
}

interface ProductTableProps {
  products: Product[];
  selectedProducts: string[];
  onProductSelect: (productId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedProducts,
  onProductSelect,
  onSelectAll
}) => {
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;

  const renderBrandLogo = (brand: Product['brand']) => {
    if (brand.name === 'Apple') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.7309 12.6566C17.7605 15.8346 20.5189 16.8922 20.5494 16.9056C20.5261 16.9802 20.1087 18.4127 19.0962 19.8924C18.2208 21.1717 17.3125 22.4463 15.8814 22.4727C14.4753 22.4986 14.0232 21.6389 12.4156 21.6389C10.8085 21.6389 10.3061 22.4463 8.97505 22.4986C7.59375 22.5509 6.54187 21.1153 5.65936 19.8407C3.85599 17.2335 2.47784 12.4733 4.32835 9.26014C5.24764 7.66446 6.89048 6.65402 8.67365 6.6281C10.0301 6.60223 11.3103 7.54065 12.1395 7.54065C12.9682 7.54065 14.524 6.41212 16.1596 6.57786C16.8443 6.60636 18.7663 6.85444 20.0004 8.66093C19.901 8.72257 17.7071 9.99974 17.7309 12.6566ZM15.0883 4.85297C15.8216 3.96528 16.3152 2.72955 16.1806 1.5C15.1235 1.54248 13.8453 2.20439 13.0871 3.09159C12.4076 3.87724 11.8125 5.13472 11.9731 6.33993C13.1513 6.43109 14.3549 5.74121 15.0883 4.85297Z" fill="black"/>
        </svg>
      );
    }

    if (brand.name === 'Shopify') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.9345 5.58876C18.92 5.48315 18.8276 5.42478 18.7513 5.41837C18.6751 5.41196 17.0624 5.29236 17.0624 5.29236C17.0624 5.29236 15.9424 4.17945 15.8195 4.0563C15.6965 3.93315 15.4563 3.9706 15.3631 3.9981C15.3492 4.00214 15.1183 4.0735 14.7362 4.19176C14.362 3.11428 13.7018 2.12402 12.5402 2.12402C12.5082 2.12402 12.4751 2.12537 12.4421 2.12722C12.1117 1.68996 11.7025 1.5 11.349 1.5C8.64314 1.5 7.35036 4.88562 6.945 6.60618C5.89359 6.93228 5.14657 7.16407 5.05117 7.1941C4.46428 7.37832 4.44574 7.39688 4.36871 7.95038C4.31056 8.36943 2.7749 20.256 2.7749 20.256L14.7411 22.5L21.2249 21.0961C21.2249 21.0961 18.9488 5.69437 18.9345 5.58876ZM14.0748 4.39656C13.7743 4.48969 13.4327 4.59546 13.0624 4.71018C13.0627 4.63882 13.063 4.56847 13.063 4.49171C13.063 3.82197 12.9702 3.28281 12.8212 2.85533C13.4197 2.93057 13.8183 3.61211 14.0748 4.39656ZM12.0787 2.98809C12.2451 3.40546 12.3533 4.00434 12.3533 4.81258C12.3533 4.85391 12.3529 4.8917 12.3526 4.92999C11.6941 5.13412 10.9786 5.35579 10.2614 5.57813C10.6641 4.02273 11.4188 3.27151 12.0787 2.98809ZM11.2747 2.22642C11.3915 2.22642 11.5092 2.26606 11.6218 2.34366C10.7546 2.75208 9.82502 3.78081 9.43246 5.83506C8.85872 6.01287 8.29795 6.18663 7.77949 6.3474C8.2393 4.78052 9.33116 2.22642 11.2747 2.22642Z" fill="#95BF46"/>
          <path d="M18.7512 5.41858C18.675 5.41217 17.0623 5.29257 17.0623 5.29257C17.0623 5.29257 15.9423 4.17966 15.8194 4.05651C15.7734 4.01062 15.7114 3.98717 15.6465 3.97705L14.7417 22.5L21.2248 21.0963C21.2248 21.0963 18.9487 5.69458 18.9344 5.58897C18.9199 5.48336 18.8275 5.425 18.7512 5.41858Z" fill="#5E8E3E"/>
          <path d="M12.5401 9.00404L11.7407 11.3842C11.7407 11.3842 11.0402 11.01 10.1816 11.01C8.92289 11.01 8.85951 11.8007 8.85951 12C8.85951 13.0871 11.6908 13.5036 11.6908 16.0499C11.6908 18.0532 10.4213 19.3433 8.7095 19.3433C6.65538 19.3433 5.60498 18.0637 5.60498 18.0637L6.15496 16.2449C6.15496 16.2449 7.23469 17.1728 8.14587 17.1728C8.74119 17.1728 8.9834 16.7036 8.9834 16.3608C8.9834 14.9428 6.66061 14.8795 6.66061 12.5494C6.66061 10.5883 8.06699 8.69043 10.9059 8.69043C11.9998 8.69043 12.5401 9.00404 12.5401 9.00404Z" fill="white"/>
        </svg>
      );
    }

    if (brand.logo) {
      return (
        <img src={brand.logo} alt={brand.name} className="w-6 h-6 rounded-full" />
      );
    }

    return (
      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-xs font-medium text-gray-600">{brand.name.charAt(0)}</span>
      </div>
    );
  };

  const renderCompetitorPrices = (competitors: Product['competitors']) => {
    const getTextColor = (color: string) => {
      switch (color) {
        case 'green': return 'text-[#0E9F6E]';
        case 'red': return 'text-[#F05252]';
        default: return 'text-[#0E121B]';
      }
    };

    if (competitors.cheapest === '-') {
      return (
        <div className="flex flex-col justify-center items-start gap-0.5 flex-1">
          <div className="flex justify-between items-start self-stretch">
            <span className="flex-1 text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Cheapest Price:</span>
            <span className="flex-1 text-[#0E121B] text-right font-inter text-xs font-normal leading-5 tracking-[-0.06px]">-</span>
          </div>
          <div className="flex justify-between items-start self-stretch">
            <span className="flex-1 text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Avg Price:</span>
            <span className="flex-1 text-[#0E121B] text-right font-inter text-xs font-normal leading-5 tracking-[-0.06px]">-</span>
          </div>
          <div className="flex justify-between items-start self-stretch">
            <span className="flex-1 text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Highest Price:</span>
            <span className="flex-1 text-[#0E121B] text-right font-inter text-xs font-normal leading-5 tracking-[-0.06px]">-</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-center items-start gap-0.5 flex-1">
        <div className="flex justify-between items-start self-stretch">
          <span className="flex-1 text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Cheapest Price:</span>
          <span className={`w-14 ${getTextColor(competitors.cheapestColor)} text-right font-inter text-xs font-normal leading-5 tracking-[-0.06px]`}>
            {competitors.cheapest}
          </span>
        </div>
        <div className="flex justify-between items-start self-stretch">
          <span className="flex-1 text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Avg Price:</span>
          <span className="w-14 text-[#0E121B] text-right font-inter text-xs font-normal leading-5 tracking-[-0.06px]">
            {competitors.avg}
          </span>
        </div>
        <div className="flex justify-between items-start self-stretch">
          <span className="flex-1 text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Highest Price:</span>
          <span className="w-14 text-[#0E121B] text-right font-inter text-xs font-normal leading-5 tracking-[-0.06px]">
            {competitors.highest}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-[1120px] h-[810px] flex-col items-start flex-shrink-0 rounded-xl border border-[#DEE0E3] bg-white mb-5">
      {/* Table */}
      <div className="flex items-start self-stretch bg-white">
        {/* Product Name Column - 240px */}
        <div className="flex w-[240px] h-[750px] flex-col items-start">
          {/* Header */}
          <div className="flex h-10 px-3 items-center gap-3 flex-shrink-0 self-stretch bg-[#F7F7F8]">
            <div className="w-4 h-4">
              <div className="w-4 h-4 flex-shrink-0 border border-[#DEE0E3] bg-white shadow-[0_1px_2px_0_rgba(20,21,26,0.05)] rounded-[4px] relative">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex px-0 items-center gap-0.5">
              <span className="text-[#525866] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Product Name</span>
            </div>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div key={product.id} className="flex h-[88px] px-3 items-center gap-3 flex-shrink-0 self-stretch border-b border-[#E9EAEC] bg-white">
              <div className="w-4 h-4">
                <div className="w-4 h-4 flex-shrink-0 border border-[#DEE0E3] bg-white shadow-[0_1px_2px_0_rgba(20,21,26,0.05)] rounded-[4px] relative">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => onProductSelect(product.id, e.target.checked)}
                    className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex px-0 items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex px-0 flex-col justify-center items-start gap-0.5 flex-1">
                  <div className="self-stretch text-[#0E121B] font-inter text-xs font-medium leading-5 tracking-[-0.06px]">
                    {product.name}
                  </div>
                  <div className="self-stretch text-[#525866] font-inter text-xs font-normal leading-4">
                    SKU: {product.sku}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Matches Suggested Column - 139px */}
        <div className="flex w-[139px] h-[750px] flex-col items-start">
          {/* Header */}
          <div className="flex h-10 px-3 items-center gap-3 flex-shrink-0 self-stretch bg-[#F7F7F8]">
            <div className="flex px-0 items-center gap-0.5">
              <span className="text-[#525866] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Matches Suggested</span>
            </div>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div key={product.id} className="flex h-[88px] px-3 items-center gap-2 flex-shrink-0 self-stretch border-b border-[#E9EAEC] bg-white">
              <div className="flex h-6 items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#375DFB] relative">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0">
                    <g filter="url(#filter0_i_8083_141064)">
                      <circle cx="12" cy="12" r="12" fill="#375DFB"/>
                    </g>
                    <defs>
                      <filter id="filter0_i_8083_141064" x="0" y="-8" width="24" height="32" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="-8"/>
                        <feGaussianBlur stdDeviation="8"/>
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0.7712 0 0 0 0 0.78 0 0 0 0 0.7888 0 0 0 0.48 0"/>
                        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_8083_141064"/>
                      </filter>
                    </defs>
                  </svg>
                  <span className="w-6 text-white text-center font-inter text-xs font-medium leading-4 absolute left-0 top-1 h-4">All</span>
                </div>
                <a href="#" className="text-[#375DFB] font-inter text-sm font-normal leading-5 tracking-[-0.084px] underline decoration-solid decoration-auto underline-offset-auto">
                  Show
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Column - 84px */}
        <div className="flex w-[84px] h-[750px] flex-col items-start">
          {/* Header */}
          <div className="flex h-10 px-3 items-center gap-3 flex-shrink-0 self-stretch bg-[#F7F7F8]">
            <div className="flex px-0 items-center gap-0.5">
              <span className="text-[#525866] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Cost</span>
            </div>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div key={product.id} className="flex h-[88px] px-3 items-center gap-2 flex-shrink-0 self-stretch border-b border-[#E9EAEC] bg-white">
              <div className="flex px-0 flex-col justify-center items-start gap-0.5 flex-1">
                <span className="self-stretch text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">
                  {product.cost}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Price Column - 100px */}
        <div className="flex w-[100px] h-[750px] flex-col items-start">
          {/* Header */}
          <div className="flex h-10 px-3 items-center gap-3 flex-shrink-0 self-stretch bg-[#F7F7F8]">
            <div className="flex px-0 items-center gap-0.5">
              <span className="text-[#525866] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Price</span>
            </div>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div key={product.id} className="flex h-[88px] px-3 flex-col justify-center items-start gap-0.5 flex-shrink-0 self-stretch border-b border-[#E9EAEC] bg-white">
              <div className="flex px-0 items-center gap-1.25 self-stretch">
                <span className="text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">
                  {product.price}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Min/Max Price Column - 152px */}
        <div className="flex w-[152px] h-[750px] flex-col items-start">
          {/* Header */}
          <div className="flex h-10 px-3 items-center gap-3 flex-shrink-0 self-stretch bg-[#F7F7F8]">
            <div className="flex px-0 items-center gap-0.5">
              <span className="text-[#525866] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Min/Max Price</span>
            </div>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div key={product.id} className="flex h-[88px] px-3 items-center gap-2 flex-shrink-0 self-stretch border-b border-[#E9EAEC] bg-white">
              <div className="flex px-0 flex-col justify-center items-start gap-0.5 flex-1">
                <div className="flex justify-between items-start self-stretch">
                  <span className="flex-1 text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Min Price:</span>
                  <span className="flex-1 text-[#0E121B] text-right font-inter text-xs font-normal leading-5 tracking-[-0.06px]">{product.minPrice}</span>
                </div>
                <div className="flex justify-between items-start self-stretch">
                  <span className="flex-1 text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Max Price:</span>
                  <span className="flex-1 text-[#0E121B] text-right font-inter text-xs font-normal leading-5 tracking-[-0.06px]">{product.maxPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Column - 132px */}
        <div className="flex w-[132px] h-[750px] flex-col items-start">
          {/* Header */}
          <div className="flex h-10 px-3 items-center gap-3 flex-shrink-0 self-stretch bg-[#F7F7F8]">
            <div className="flex px-0 items-center gap-0.5">
              <span className="text-[#525866] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Brand</span>
            </div>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div key={product.id} className="flex h-[88px] px-3 items-center gap-2 flex-shrink-0 self-stretch border-b border-[#E9EAEC] bg-white">
              {renderBrandLogo(product.brand)}
              <div className="flex px-0 flex-col justify-center items-start gap-0.5 flex-1">
                <span className="self-stretch text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">
                  {product.brand.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Competitors Prices Column - 212px */}
        <div className="flex w-[212px] h-[750px] flex-col items-start">
          {/* Header */}
          <div className="flex h-10 px-3 items-center gap-3 flex-shrink-0 self-stretch bg-[#F7F7F8]">
            <div className="flex px-0 items-center gap-0.5">
              <span className="text-[#525866] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Competitors Prices</span>
            </div>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div key={product.id} className="flex h-[88px] px-3 items-center gap-2 flex-shrink-0 self-stretch border-b border-[#E9EAEC] bg-white">
              {renderCompetitorPrices(product.competitors)}
            </div>
          ))}
        </div>

        {/* Triggered Rule Column - 182px */}
        <div className="flex w-[182px] h-[750px] flex-col items-start">
          {/* Header */}
          <div className="flex h-10 px-3 items-center gap-3 flex-shrink-0 self-stretch bg-[#F7F7F8]">
            <div className="flex px-0 items-center gap-0.5">
              <span className="text-[#525866] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">Triggered Rule</span>
            </div>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div key={product.id} className="flex h-[88px] px-3 items-center gap-2 flex-shrink-0 self-stretch border-b border-[#E9EAEC] bg-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 14C4.6862 14 2 11.3138 2 8C2 4.6862 4.6862 2 8 2C11.3138 2 14 4.6862 14 8C14 11.3138 11.3138 14 8 14ZM8 12.8C9.27304 12.8 10.4939 12.2943 11.3941 11.3941C12.2943 10.4939 12.8 9.27304 12.8 8C12.8 6.72696 12.2943 5.50606 11.3941 4.60589C10.4939 3.70571 9.27304 3.2 8 3.2C6.72696 3.2 5.50606 3.70571 4.60589 4.60589C3.70571 5.50606 3.2 6.72696 3.2 8C3.2 9.27304 3.70571 10.4939 4.60589 11.3941C5.50606 12.2943 6.72696 12.8 8 12.8ZM5.9 9.2H9.2C9.27957 9.2 9.35587 9.16839 9.41213 9.11213C9.46839 9.05587 9.5 8.97957 9.5 8.9C9.5 8.82044 9.46839 8.74413 9.41213 8.68787C9.35587 8.63161 9.27957 8.6 9.2 8.6H6.8C6.40218 8.6 6.02064 8.44197 5.73934 8.16066C5.45804 7.87936 5.3 7.49783 5.3 7.1C5.3 6.70218 5.45804 6.32064 5.73934 6.03934C6.02064 5.75804 6.40218 5.6 6.8 5.6H7.4V4.4H8.6V5.6H10.1V6.8H6.8C6.72044 6.8 6.64413 6.83161 6.58787 6.88787C6.53161 6.94413 6.5 7.02044 6.5 7.1C6.5 7.17956 6.53161 7.25587 6.58787 7.31213C6.64413 7.36839 6.72044 7.4 6.8 7.4H9.2C9.59783 7.4 9.97936 7.55804 10.2607 7.83934C10.542 8.12064 10.7 8.50218 10.7 8.9C10.7 9.29782 10.542 9.67936 10.2607 9.96066C9.97936 10.242 9.59783 10.4 9.2 10.4H8.6V11.6H7.4V10.4H5.9V9.2Z" fill="#0E121B"/>
              </svg>
              <div className="flex px-0 flex-col justify-center items-start gap-0.5 flex-1">
                <span className="self-stretch text-[#0E121B] font-inter text-xs font-normal leading-5 tracking-[-0.06px]">
                  {product.triggeredRule}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollbar */}
      <div className="w-[1120px] h-[17px] bg-[#F1F1F1] relative bottom-1">
        <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-1.5 top-1.25">
          <path d="M5 8.74228e-08L5 7H4V6H3V5H2L2 4H1V3H2V2H3L3 1L4 1V0L5 8.74228e-08Z" fill="#A3A3A3"/>
        </svg>
        <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-1.5 top-1.25">
          <path d="M2 8.74228e-08L2 7H3V6H4V5H5L5 4H6V3H5V2H4L4 1L3 1V0L2 8.74228e-08Z" fill="#505050"/>
        </svg>
        <div className="w-3.25 h-6.25 bg-[#C1C1C1] absolute left-3.75 top-0.5 transform -rotate-90"></div>
      </div>
    </div>
  );
};

export default ProductTable;
