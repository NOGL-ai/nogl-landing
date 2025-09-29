'use client';

import React from 'react';

interface CatalogHeaderProps {
  productCount: number;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  productCount
}) => {
  return (
    <div className="mb-5">
      {/* Top Page Header */}
      <div className="flex w-full items-start gap-3 border border-[#F2F2F2] rounded-xl bg-white mb-5 h-[61px]">
        <div className="flex items-start gap-1.5 flex-1 px-6 py-4">
          <div className="flex flex-col items-start gap-1 flex-1">
            <div className="flex justify-between items-center self-stretch">
              <div className="flex items-center gap-3">
                <h1 className="text-[#14151A] font-inter text-2xl font-semibold leading-8 tracking-[-0.336px]">
                  My Catalog
                </h1>
                <div className="flex px-3 py-1.5 items-center gap-0.5 rounded bg-[rgba(55,93,251,0.1)]">
                  <span className="text-[#375DFB] font-inter text-xs font-medium leading-4">
                    {productCount} Products
                  </span>
                </div>
              </div>
              <div className="flex px-3 py-2 items-center gap-2 rounded-[5px] bg-[#375DFB]">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-[Roboto_Flex] text-sm font-medium leading-[21px]">
                    Catalog Functions
                  </span>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-90">
                  <path d="M10.0009 11.2958L13.7134 7.58325L14.7739 8.64375L10.0009 13.4168L5.22793 8.64375L6.28843 7.58325L10.0009 11.2958Z" fill="white"/>
                </svg>
              </div>
            </div>
            <p className="self-stretch text-[rgba(15,19,36,0.6)] font-inter text-sm font-normal leading-5 tracking-[-0.07px]">
              Import and manage your products
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CatalogHeader;
