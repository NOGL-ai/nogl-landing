'use client';

import React from 'react';

interface CatalogHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  productCount: number;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  searchQuery,
  onSearchChange,
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

      {/* Search and Action Bar */}
      <div className="flex items-center justify-between w-full h-[60px] mb-5">
        {/* Search Input */}
        <div className="flex flex-col items-center gap-1 w-[308px] h-9">
          <div className="flex px-2 py-2 pl-2.5 items-center gap-2 self-stretch rounded-lg border border-[#E2E4E9] bg-white shadow-[0_1px_2px_0_rgba(228,229,231,0.24)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.25 2.5C12.976 2.5 16 5.524 16 9.25C16 12.976 12.976 16 9.25 16C5.524 16 2.5 12.976 2.5 9.25C2.5 5.524 5.524 2.5 9.25 2.5ZM9.25 14.5C12.1502 14.5 14.5 12.1502 14.5 9.25C14.5 6.349 12.1502 4 9.25 4C6.349 4 4 6.349 4 9.25C4 12.1502 6.349 14.5 9.25 14.5ZM15.6137 14.5532L17.7355 16.6742L16.6742 17.7355L14.5532 15.6137L15.6137 14.5532Z" fill="#868C98"/>
            </svg>
            <input
              type="text"
              placeholder="Search a catalog..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 text-[#868C98] font-inter text-sm font-normal leading-5 tracking-[-0.084px] outline-none bg-transparent placeholder:text-[#868C98]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Columns Button */}
          <button className="inline-flex px-2 py-2 pl-2.5 justify-center items-center gap-1 rounded-lg border border-[#E2E4E9] bg-white shadow-[0_1px_2px_0_rgba(82,88,102,0.06)] w-[109px] h-9">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.65982 11.5451C2.44412 10.5264 2.44412 9.47377 2.65982 8.45507C3.49232 8.55257 4.21982 8.27732 4.45682 7.70432C4.69457 7.13057 4.37582 6.42182 3.71732 5.90207C4.2851 5.02931 5.02931 4.2851 5.90207 3.71732C6.42107 4.37507 7.13057 4.69457 7.70432 4.45682C8.27807 4.21907 8.55332 3.49232 8.45507 2.65982C9.47377 2.44412 10.5264 2.44412 11.5451 2.65982C11.4476 3.49232 11.7228 4.21982 12.2958 4.45682C12.8696 4.69457 13.5783 4.37582 14.0981 3.71732C14.9708 4.2851 15.715 5.02931 16.2828 5.90207C15.6251 6.42107 15.3056 7.13057 15.5433 7.70432C15.7811 8.27807 16.5078 8.55332 17.3403 8.45507C17.556 9.47377 17.556 10.5264 17.3403 11.5451C16.5078 11.4476 15.7803 11.7228 15.5433 12.2958C15.3056 12.8696 15.6243 13.5783 16.2828 14.0981C15.715 14.9708 14.9708 15.715 14.0981 16.2828C13.5791 15.6251 12.8696 15.3056 12.2958 15.5433C11.7221 15.7811 11.4468 16.5078 11.5451 17.3403C10.5264 17.556 9.47377 17.556 8.45507 17.3403C8.55257 16.5078 8.27732 15.7803 7.70432 15.5433C7.13057 15.3056 6.42182 15.6243 5.90207 16.2828C5.02931 15.715 4.2851 14.9708 3.71732 14.0981C4.37507 13.5791 4.69457 12.8696 4.45682 12.2958C4.21907 11.7221 3.49232 11.4468 2.65982 11.5451ZM4.00007 10.1576C4.82507 10.3863 5.50532 10.9091 5.84282 11.7221C6.17957 12.5358 6.06782 13.3871 5.64632 14.1311C5.71832 14.2076 5.79257 14.2818 5.86907 14.3538C6.61382 13.9323 7.46432 13.8213 8.27807 14.1573C9.09107 14.4948 9.61382 15.1751 9.84257 16.0001C9.94757 16.0031 10.0526 16.0031 10.1576 16.0001C10.3863 15.1751 10.9091 14.4948 11.7221 14.1573C12.5358 13.8206 13.3871 13.9323 14.1311 14.3538C14.2076 14.2818 14.2818 14.2076 14.3538 14.1311C13.9323 13.3863 13.8213 12.5358 14.1573 11.7221C14.4948 10.9091 15.1751 10.3863 16.0001 10.1576C16.0031 10.0526 16.0031 9.94757 16.0001 9.84257C15.1751 9.61382 14.4948 9.09107 14.1573 8.27807C13.8206 7.46432 13.9323 6.61307 14.3538 5.86907C14.2815 5.79286 14.2073 5.71859 14.1311 5.64632C13.3863 6.06782 12.5358 6.17882 11.7221 5.84282C10.9091 5.50532 10.3863 4.82507 10.1576 4.00007C10.0526 3.99729 9.94755 3.99729 9.84257 4.00007C9.61382 4.82507 9.09107 5.50532 8.27807 5.84282C7.46432 6.17957 6.61307 6.06782 5.86907 5.64632C5.79257 5.71832 5.71832 5.79257 5.64632 5.86907C6.06782 6.61382 6.17882 7.46432 5.84282 8.27807C5.50532 9.09107 4.82507 9.61382 4.00007 9.84257C3.99707 9.94757 3.99707 10.0526 4.00007 10.1576ZM10.0001 12.2501C9.40333 12.2501 8.83103 12.013 8.40908 11.5911C7.98712 11.1691 7.75007 10.5968 7.75007 10.0001C7.75007 9.40333 7.98712 8.83103 8.40908 8.40908C8.83103 7.98712 9.40333 7.75007 10.0001 7.75007C10.5968 7.75007 11.1691 7.98712 11.5911 8.40908C12.013 8.83103 12.2501 9.40333 12.2501 10.0001C12.2501 10.5968 12.013 11.1691 11.5911 11.5911C11.1691 12.013 10.5968 12.2501 10.0001 12.2501ZM10.0001 10.7501C10.199 10.7501 10.3897 10.671 10.5304 10.5304C10.671 10.3897 10.7501 10.199 10.7501 10.0001C10.7501 9.80115 10.671 9.61039 10.5304 9.46974C10.3897 9.32908 10.199 9.25007 10.0001 9.25007C9.80115 9.25007 9.61039 9.32908 9.46974 9.46974C9.32908 9.61039 9.25007 9.80115 9.25007 10.0001C9.25007 10.199 9.32908 10.3897 9.46974 10.5304C9.61039 10.671 9.80115 10.7501 10.0001 10.7501Z" fill="#54565B"/>
            </svg>
            <div className="flex px-1 justify-center items-center gap-2">
              <span className="text-[#54565B] text-center font-inter text-sm font-medium leading-5 tracking-[-0.084px]">
                Columns
              </span>
            </div>
          </button>

          {/* Filter Button */}
          <button className="inline-flex px-2 py-2 pl-2.5 justify-center items-center gap-1 rounded-lg border border-[#E2E4E9] bg-white shadow-[0_1px_2px_0_rgba(82,88,102,0.06)] w-[84px] h-9">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="#54565B"/>
            </svg>
            <div className="flex px-1 justify-center items-center gap-2">
              <span className="text-[#54565B] text-center font-inter text-sm font-medium leading-5 tracking-[-0.084px]">
                Filter
              </span>
            </div>
          </button>

          {/* Massive Actions Button */}
          <button className="inline-flex px-2 py-2 pl-2.5 justify-center items-center gap-1 rounded-lg border border-[#E2E4E9] bg-white shadow-[0_1px_2px_0_rgba(82,88,102,0.06)] w-[159px] h-9">
            <div className="flex px-1 justify-center items-center gap-2">
              <span className="text-[#54565B] text-center font-inter text-sm font-medium leading-5 tracking-[-0.084px]">
                Massive Actions
              </span>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0001 10.879L13.7126 7.1665L14.7731 8.227L10.0001 13L5.22705 8.227L6.28755 7.1665L10.0001 10.879Z" fill="#525866"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogHeader;
