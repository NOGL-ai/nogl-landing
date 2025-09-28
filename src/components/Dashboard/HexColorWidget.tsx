'use client';

import React, { useState } from 'react';

interface HexColorWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect?: (color: string) => void;
}

const HexColorWidget: React.FC<HexColorWidgetProps> = ({ isOpen, onClose, onColorSelect }) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTheme, setActiveTheme] = useState<'primary' | 'secondary'>('primary');

  const colorThemes = {
    primary: {
      name: 'Primary Theme',
      colors: [
        { name: 'Blue', value: '#215DFF' },
        { name: 'Cyan', value: '#00C4FF' },
        { name: 'Purple', value: '#8350FD' }
      ]
    },
    secondary: {
      name: 'Secondary Theme',
      colors: [
        { name: 'Red', value: '#FB3748' },
        { name: 'Light Gray', value: '#CACFD8' },
        { name: 'Green', value: '#1FC16B' }
      ]
    }
  };

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    if (onColorSelect) {
      onColorSelect(color);
    }
  };

  const handleThemeClick = (theme: 'primary' | 'secondary') => {
    setActiveTheme(theme);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        data-layer="Container" 
        className="Container" 
        style={{
          height: 32, 
          padding: 6, 
          background: 'var(--bg-white-0, white)', 
          boxShadow: '0px 1px 2px rgba(10, 13, 20, 0.03)', 
          borderRadius: 8, 
          outline: '1px var(--stroke-soft-200, #E1E4EA) solid', 
          outlineOffset: '-1px', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 2, 
          display: 'inline-flex'
        }}
      >
        <div 
          data-layer="check_small" 
          className="CheckSmall" 
          style={{
            width: 24, 
            height: 24, 
            position: 'relative'
          }}
        >
          <div 
            data-layer="container" 
            className="Container" 
            style={{
              width: 18, 
              height: 18, 
              left: 3, 
              top: 3, 
              position: 'absolute', 
              background: 'var(--Schemes-Primary, #65558F)', 
              borderRadius: 300
            }} 
          />
          <div 
            data-layer="icon" 
            className="Icon" 
            style={{
              width: 12, 
              height: 9.40, 
              left: 6, 
              top: 7, 
              position: 'absolute', 
              background: 'var(--Schemes-On-Primary, white)'
            }} 
          />
        </div>
        
        <div 
          data-layer="Wrap" 
          className="Wrap" 
          style={{
            width: 94, 
            height: 20, 
            justifyContent: 'flex-start', 
            alignItems: 'center', 
            gap: 8, 
            display: 'flex'
          }}
        >
          {colorThemes[activeTheme].colors.map((color, index) => (
            <div 
              key={index}
              data-layer="Chart Legends [1.0]" 
              className="ChartLegends10" 
              style={{
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 7, 
                display: 'flex'
              }}
            >
              <div 
                data-layer="Chart Legend Dots [1.0]" 
                data-colors={color.name} 
                data-size="Small (16)" 
                className="ChartLegendDots10" 
                style={{
                  width: 28, 
                  height: 28, 
                  position: 'relative', 
                  overflow: 'hidden'
                }}
              >
                <div 
                  data-layer="Ellipse" 
                  className="Ellipse" 
                  style={{
                    width: 21, 
                    height: 21, 
                    left: 3.50, 
                    top: 3.50, 
                    position: 'absolute', 
                    background: color.value, 
                    boxShadow: '0px 2px 4px rgba(27, 28, 29, 0.04)', 
                    borderRadius: 9999, 
                    border: '3.50px var(--stroke-white-0, white) solid',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleColorClick(color.value)}
                  title={color.name}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Theme Selection Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => handleThemeClick('primary')}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: activeTheme === 'primary' ? '2px solid #215DFF' : '1px solid #ccc',
              background: activeTheme === 'primary' ? '#f0f4ff' : 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Primary
          </button>
          <button
            onClick={() => handleThemeClick('secondary')}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: activeTheme === 'secondary' ? '2px solid #FB3748' : '1px solid #ccc',
              background: activeTheme === 'secondary' ? '#fff0f0' : 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Secondary
          </button>
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            fontSize: '14px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default HexColorWidget;