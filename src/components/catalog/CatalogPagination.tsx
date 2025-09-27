'use client';

import React from 'react';

interface CatalogPaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
}

const CatalogPagination: React.FC<CatalogPaginationProps> = ({
  currentPage,
  onPageChange,
  totalPages = 100
}) => {
  return (
    <div className="flex w-[1120px] justify-center items-center gap-2 h-10">
      {/* Previous Button */}
      <div className="flex px-2.5 py-2.5 justify-center items-center gap-1 rounded-xl bg-transparent">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5235 9.1664H16.6668V10.8331H6.5235L10.9935 15.3031L9.81516 16.4814L3.3335 9.99973L9.81516 3.51807L10.9935 4.6964L6.5235 9.1664Z" fill="#0F1324" fillOpacity="0.6"/>
        </svg>
      </div>

      {/* Page Number: 1 */}
      <div className="flex w-10 h-10 px-2.5 py-2.5 justify-center items-center gap-1 flex-shrink-0 rounded-xl">
        <div className="text-[rgba(15,19,36,0.6)] text-center font-inter text-base font-medium leading-6 tracking-[-0.16px]">
          1
        </div>
      </div>

      {/* Dots */}
      <div className="flex w-10 h-10 px-2.5 py-2.5 justify-center items-center gap-1 flex-shrink-0 rounded-xl">
        <div className="text-[rgba(15,19,36,0.6)] text-center font-inter text-base font-medium leading-6 tracking-[-0.16px]">
          ...
        </div>
      </div>

      {/* Page Number: 56 */}
      <div className="flex w-10 h-10 px-2.5 py-2.5 justify-center items-center gap-1 flex-shrink-0 rounded-xl">
        <div className="text-[rgba(15,19,36,0.6)] text-center font-inter text-base font-medium leading-6 tracking-[-0.16px]">
          56
        </div>
      </div>

      {/* Page Number: 57 (Active) */}
      <div className="flex w-10 h-10 px-2.5 py-2.5 justify-center items-center gap-1 flex-shrink-0 rounded-xl bg-white">
        <div className="text-[#14151A] text-center font-inter text-base font-medium leading-6 tracking-[-0.16px]">
          {currentPage}
        </div>
      </div>

      {/* Page Number: 58 */}
      <div className="flex w-10 h-10 px-2.5 py-2.5 justify-center items-center gap-1 flex-shrink-0 rounded-xl cursor-pointer" onClick={() => onPageChange(58)}>
        <div className="text-[rgba(15,19,36,0.6)] text-center font-inter text-base font-medium leading-6 tracking-[-0.16px]">
          58
        </div>
      </div>

      {/* Dots */}
      <div className="flex w-10 h-10 px-2.5 py-2.5 justify-center items-center gap-1 flex-shrink-0 rounded-xl">
        <div className="text-[rgba(15,19,36,0.6)] text-center font-inter text-base font-medium leading-6 tracking-[-0.16px]">
          ...
        </div>
      </div>

      {/* Page Number: 100 */}
      <div className="flex w-10 h-10 px-2.5 py-2.5 justify-center items-center gap-1 flex-shrink-0 rounded-xl cursor-pointer" onClick={() => onPageChange(100)}>
        <div className="text-[rgba(15,19,36,0.6)] text-center font-inter text-base font-medium leading-6 tracking-[-0.16px]">
          100
        </div>
      </div>

      {/* Next Button */}
      <div className="flex px-2.5 py-2.5 justify-center items-center gap-1 rounded-xl bg-transparent cursor-pointer" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.4768 9.1664L9.00683 4.6964L10.1852 3.51807L16.6668 9.99973L10.1852 16.4814L9.00683 15.3031L13.4768 10.8331H3.3335V9.1664H13.4768Z" fill="#0F1324" fillOpacity="0.6"/>
        </svg>
      </div>
    </div>
  );
};

export default CatalogPagination;
