'use client';

import React, { useState } from 'react';
import ChartDropdown from './ChartDropdown';

interface StackedBarData {
  month: string;
  overpriced: number;
  samePrice: number;
  competitive: number;
}

interface StackedBarChartProps {
  data: StackedBarData[];
  title: string;
  maxValue?: number;
  className?: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  title,
  maxValue = 20000,
  className = '',
}) => {
  const [timePeriod, setTimePeriod] = useState('last-year');

  const yAxisLabels = ['20k', '15k', '10k', '0'];
  const chartHeight = 242;
  
  const legends = [
    { label: 'Overpriced product', color: '#FB3748' },
    { label: 'Same price product', color: '#CACFD8' },
    { label: 'Competitive product', color: '#1FC16B' },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-[#E2E4E9] dark:border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-start gap-2">
          <span 
            className="text-[#111827] dark:text-white font-medium text-base leading-6"
            style={{
              fontFamily: 'Inter',
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '-0.176px'
            }}
          >
            {title}
          </span>
        </div>
        <ChartDropdown 
          value={timePeriod}
          onChange={setTimePeriod}
        />
      </div>

      {/* Chart */}
      <div className="flex items-start gap-6">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between h-[242px] w-6">
          {yAxisLabels.map((label, index) => (
            <span 
              key={index}
              className="text-[#525866] dark:text-gray-400 text-xs leading-4"
              style={{
                fontFamily: 'Inter',
                fontSize: '12px',
                lineHeight: '16px'
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Chart Content */}
        <div className="flex-1 pr-2">
          <div className="flex items-start gap-6">
            {/* Bars Container */}
            <div className="flex gap-6 flex-1">
              {data.map((item, index) => {
                const total = item.overpriced + item.samePrice + item.competitive;
                const overpricedHeight = Math.max(16, (item.overpriced / maxValue) * chartHeight);
                const samePriceHeight = Math.max(0, (item.samePrice / maxValue) * chartHeight);
                const competitiveHeight = Math.max(0, (item.competitive / maxValue) * chartHeight);
                const usedHeight = overpricedHeight + samePriceHeight + competitiveHeight;
                const emptyHeight = Math.max(0, chartHeight - usedHeight);

                return (
                  <div key={index} className="flex flex-col items-center gap-3 flex-1">
                    {/* Bar */}
                    <div className="flex flex-col justify-end items-center gap-0.5 flex-1" style={{ height: chartHeight }}>
                      {/* Empty space */}
                      <div 
                        className="bg-[#F5F7FA] w-full"
                        style={{ height: `${emptyHeight}px` }}
                      />
                      {/* Stacked segments */}
                      {competitiveHeight > 0 && (
                        <div 
                          className="bg-[#1FC16B] w-full"
                          style={{ height: `${competitiveHeight}px` }}
                        />
                      )}
                      {samePriceHeight > 0 && (
                        <div 
                          className="bg-[#CACFD8] w-full"
                          style={{ height: `${samePriceHeight}px` }}
                        />
                      )}
                      <div 
                        className="bg-[#FB3748] w-full"
                        style={{ height: `${overpricedHeight}px` }}
                      />
                    </div>
                    
                    {/* Month label */}
                    <span 
                      className="text-[#525866] dark:text-gray-400 text-center text-xs leading-4"
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '12px',
                        lineHeight: '16px'
                      }}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-0 mt-5 rounded-[10px]">
        {legends.map((legend, index) => (
          <div key={index} className="flex flex-col items-start gap-2 flex-1 p-4">
            <div className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: legend.color }}
              />
              <span 
                className="text-[#0F1324] dark:text-gray-300 text-sm leading-5 opacity-60"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.07px'
                }}
              >
                {legend.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StackedBarChart;
