'use client';

import React from 'react';

interface PieChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  centerValue: string;
  centerLabel: string;
  title: string;
  size?: number;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  centerValue,
  centerLabel,
  title,
  size = 169,
  className = '',
}) => {
  // Calculate cumulative percentages for pie segments
  let cumulativePercentage = 0;
  const segments = data.map((item) => {
    const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
    cumulativePercentage += item.percentage;
    const endAngle = cumulativePercentage * 3.6;
    return {
      ...item,
      startAngle,
      endAngle,
    };
  });

  // Generate SVG path for each segment
  const generatePath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 20) / 2; // Leave some margin

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-[#E2E4E9] dark:border-gray-700 p-5 ${className}`}>
      {/* Title */}
      <div className="flex justify-between items-center mb-5">
        <h3 
          className="text-[#111827] dark:text-white font-bold text-lg leading-6"
          style={{
            fontFamily: 'Manrope',
            fontSize: '18px',
            lineHeight: '24px'
          }}
        >
          {title}
        </h3>
      </div>

      <div className="flex flex-col items-center gap-5">
        {/* Pie Chart */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={generatePath(centerX, centerY, radius, segment.startAngle, segment.endAngle)}
                fill={segment.color}
              />
            ))}
          </svg>
          
          {/* Center Label */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-[0_5px_40px_0_rgba(0,0,0,0.10)] dark:shadow-[0_5px_40px_0_rgba(0,0,0,0.3)]"
            style={{ 
              width: '98px', 
              height: '98px',
              left: '36px',
              top: '36px'
            }}
          >
            <div className="text-center">
              <div 
                className="text-[#111827] dark:text-white font-bold text-2xl leading-8"
                style={{
                  fontFamily: 'Manrope',
                  fontSize: '24px',
                  lineHeight: '130%'
                }}
              >
                {centerValue}
              </div>
              <div 
                className="text-[#A0AEC0] dark:text-gray-400 font-normal text-xs leading-5"
                style={{
                  fontFamily: 'Manrope',
                  fontSize: '12px',
                  lineHeight: '160%'
                }}
              >
                {centerLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full flex flex-col gap-1">
          {data.map((item, index) => (
            <div 
              key={index}
              className="flex justify-between items-center py-2 border-b border-[#E5E5E5] dark:border-gray-600 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-[6.796px] h-[6.796px] rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span 
                  className="text-[#687588] dark:text-gray-300 font-medium text-xs leading-5"
                  style={{
                    fontFamily: 'Manrope',
                    fontSize: '12px',
                    lineHeight: '160%'
                  }}
                >
                  {item.label}
                </span>
              </div>
              <span 
                className="text-[#111827] dark:text-white font-bold text-sm leading-6 tracking-wide"
                style={{
                  fontFamily: 'Manrope',
                  fontSize: '14px',
                  lineHeight: '160%',
                  letterSpacing: '0.2px',
                  opacity: 0.75
                }}
              >
                {item.percentage.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
