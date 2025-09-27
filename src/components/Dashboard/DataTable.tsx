'use client';

import React from 'react';

interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableRow {
  [key: string]: any;
}

interface DataTableProps {
  columns: TableColumn[];
  data: TableRow[];
  title: string;
  className?: string;
  maxHeight?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  title,
  className = '',
  maxHeight = '336px',
}) => {
  const SortIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.1654 7.91667L9.9987 3.75L5.83203 7.91667H14.1654ZM14.1654 12.0833L9.9987 16.25L5.83203 12.0833H14.1654Z" fill="#868C98"/>
    </svg>
  );

  const ArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.129 9.25L9.106 5.227L10.1665 4.1665L16 10L10.1665 15.8335L9.106 14.773L13.129 10.75H4V9.25H13.129Z" fill="#14151A"/>
    </svg>
  );

  const renderCellContent = (row: TableRow, column: TableColumn) => {
    const value = row[column.id];
    
    if (column.id === 'product') {
      return (
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center w-10 h-10">
            <img 
              src={value.image} 
              alt={value.name}
              className="w-10 h-10 object-cover rounded"
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-0.5 flex-1">
            <div 
              className="text-[#14151A] dark:text-gray-200 font-medium text-sm leading-5 truncate max-w-full"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.07px'
              }}
            >
              {value.name}
            </div>
            <div 
              className="text-[#54565B] dark:text-gray-400 font-medium text-xs leading-5 truncate max-w-full"
              style={{
                fontFamily: 'Inter',
                fontSize: '12px',
                lineHeight: '20px',
                letterSpacing: '-0.06px'
              }}
            >
              {value.brand}
            </div>
          </div>
        </div>
      );
    }
    
    if (column.id === 'competitor') {
      return (
        <div className="flex items-center gap-2">
          <img 
            src={value.logo} 
            alt={value.name}
            className="w-8 h-8"
          />
          <div className="flex flex-col justify-center items-start gap-0.5 flex-1">
            <div 
              className="text-[#14151A] dark:text-gray-200 font-normal text-sm leading-5"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.07px'
              }}
            >
              {value.name}
            </div>
          </div>
        </div>
      );
    }
    
    if (column.id === 'change') {
      return (
        <div className="flex items-center gap-3">
          <span 
            className="font-normal text-sm leading-5"
            style={{
              fontFamily: 'Inter',
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.07px',
              color: value.from.includes('$') ? '#FB3748' : '#1FC16B'
            }}
          >
            {value.from}
          </span>
          <ArrowIcon />
          <span 
            className="font-normal text-sm leading-5"
            style={{
              fontFamily: 'Inter',
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.07px',
              color: value.to.includes('$') ? '#1FC16B' : '#FB3748'
            }}
          >
            {value.to}
          </span>
        </div>
      );
    }
    
    if (column.id === 'stockChange') {
      const isInStock = value.to === 'In stock';
      const isOutOfStock = value.to === 'Out of stock';
      
      const StockIcon = ({ inStock }: { inStock: boolean }) => (
        <div className="relative w-6 h-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C12.2792 21 12.5388 20.8728 13.0579 20.6184L17.2304 18.5737C19.0768 17.6688 20 17.2164 20 16.5V7.5M12 21C11.7208 21 11.4612 20.8728 10.9421 20.6184L6.76956 18.5737C4.92319 17.6688 4 17.2164 4 16.5V7.5M12 21V12" stroke={inStock ? "#26BD6C" : "#DF1C41"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.9421 3.38159C11.4612 3.1272 11.7208 3 12 3C12.2792 3 12.5388 3.1272 13.0579 3.38159L17.2304 5.42635C19.0768 6.33116 20 6.78357 20 7.5C20 8.21643 19.0768 8.66884 17.2304 9.57365L13.0579 11.6184C12.5388 11.8728 12.2792 12 12 12C11.7208 12 11.4612 11.8728 10.9421 11.6184L6.76956 9.57365C4.92319 8.66884 4 8.21643 4 7.5C4 6.78357 4.92319 6.33116 6.76956 5.42635L10.9421 3.38159Z" stroke={inStock ? "#26BD6C" : "#DF1C41"} strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <div className="absolute top-3 right-0">
            {inStock ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6.0015" cy="5.99955" r="4.15385" fill="white"/>
                <path d="M6 10.5C3.51465 10.5 1.5 8.48535 1.5 6C1.5 3.51465 3.51465 1.5 6 1.5C8.48535 1.5 10.5 3.51465 10.5 6C10.5 8.48535 8.48535 10.5 6 10.5ZM6 9.6C6.95478 9.6 7.87045 9.22072 8.54558 8.54558C9.22072 7.87045 9.6 6.95478 9.6 6C9.6 5.04522 9.22072 4.12955 8.54558 3.45442C7.87045 2.77928 6.95478 2.4 6 2.4C5.04522 2.4 4.12955 2.77928 3.45442 3.45442C2.77928 4.12955 2.4 5.04522 2.4 6C2.4 6.95478 2.77928 7.87045 3.45442 8.54558C4.12955 9.22072 5.04522 9.6 6 9.6ZM5.55135 7.8L3.642 5.89065L4.2783 5.25435L5.55135 6.5274L8.09655 3.98175L8.7333 4.61805L5.55135 7.8Z" fill="#26BD6C"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="5.9976" cy="5.99955" r="4.15385" fill="white"/>
                <path d="M6 10.5C3.51465 10.5 1.5 8.48535 1.5 6C1.5 3.51465 3.51465 1.5 6 1.5C8.48535 1.5 10.5 3.51465 10.5 6C10.5 8.48535 8.48535 10.5 6 10.5ZM6 9.6C6.95478 9.6 7.87045 9.22072 8.54558 8.54558C9.22072 7.87045 9.6 6.95478 9.6 6C9.6 5.04522 9.22072 4.12955 8.54558 3.45442C7.87045 2.77928 6.95478 2.4 6 2.4C5.04522 2.4 4.12955 2.77928 3.45442 3.45442C2.77928 4.12955 2.4 5.04522 2.4 6C2.4 6.95478 2.77928 7.87045 3.45442 8.54558C4.12955 9.22072 5.04522 9.6 6 9.6ZM6 5.3637L7.2726 4.09065L7.90935 4.7274L6.6363 6L7.90935 7.2726L7.2726 7.90935L6 6.6363L4.7274 7.90935L4.09065 7.2726L5.3637 6L4.09065 4.7274L4.7274 4.09065L6 5.3637Z" fill="#DF1C41"/>
              </svg>
            )}
          </div>
        </div>
      );
      
      return (
        <div className="flex items-center gap-3 w-full flex-wrap">
          <div className="flex items-center gap-3 flex-shrink-0">
            <StockIcon inStock={value.from === 'In stock'} />
            <span
              className="text-[#14151A] font-normal text-sm leading-5 whitespace-nowrap"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.07px'
              }}
            >
              {value.from}
            </span>
          </div>
          <div className="flex-shrink-0">
            <ArrowIcon />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <StockIcon inStock={isInStock} />
            <span
              className="text-[#14151A] font-normal text-sm leading-5 whitespace-nowrap"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.07px'
              }}
            >
              {value.to}
            </span>
          </div>
        </div>
      );
    }
    
    if (column.id === 'time') {
      return (
        <div className="flex flex-col justify-center items-start gap-0.5 flex-1">
          <span 
            className="text-[#14151A] dark:text-gray-200 font-normal text-sm leading-5"
            style={{
              fontFamily: 'Inter',
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.07px'
            }}
          >
            {value}
          </span>
        </div>
      );
    }
    
    return <span className="text-[#14151A] dark:text-gray-200 text-sm">{value}</span>;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-[#E2E4E9] dark:border-gray-700 p-4 ${className}`}>
      {/* Title */}
      <div className="mb-5">
        <h3 
          className="text-[#111827] dark:text-white font-medium text-base leading-6"
          style={{
            fontFamily: 'Inter',
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '-0.176px'
          }}
        >
          {title}
        </h3>
      </div>

      {/* Table */}
      <div
        className="border border-[#EAEDF2] dark:border-gray-600 rounded-[10px] bg-white dark:bg-gray-800 overflow-hidden"
        style={{ height: maxHeight }}
      >
        <div className="flex overflow-hidden h-full">
          {/* Table Content */}
          <div className="flex-1 flex overflow-hidden">
            {columns.map((column, colIndex) => (
              <div
                key={column.id}
                className="flex flex-col h-full"
                style={{
                  width: column.width || 'auto',
                  flex: column.width ? 'none' : '1',
                  minWidth: column.width || '100px'
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#F7F7F8] dark:bg-gray-700 border-b border-[#E9EAEC] dark:border-gray-600 h-10 flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    <span
                      className="text-[#0F1324] dark:text-gray-300 font-normal text-sm leading-5 opacity-60"
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        lineHeight: '20px',
                        letterSpacing: '-0.07px'
                      }}
                    >
                      {column.label}
                    </span>
                  </div>
                  {column.sortable && <SortIcon />}
                </div>

                {/* Cells */}
                <div className="flex-1 overflow-y-auto">
                  {data.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-center px-3 py-4 bg-white dark:bg-gray-800 border-b border-[#E9EAEC] dark:border-gray-600 last:border-b-0"
                      style={{ minHeight: '60px' }}
                    >
                      <div className="w-full">
                        {renderCellContent(row, column)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Scrollbar */}
          <div className="w-4 h-full border-l border-[#E9EAEC] bg-[#F7F7F8] relative flex-shrink-0">
            <div className="w-2 h-9 bg-[#525866] rounded-[40px] absolute left-1 top-3.5"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
