'use client';

import React, { useState } from 'react';

interface ColorWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect?: (color: string) => void;
}

const imgCheckSmall = "https://figma-alpha-api.s3.us-west-2.amazonaws.com/mcp/get_code/assets/a7d4f7f0-45d3-49c9-bb3a-4d64ec41a5ba/figma%3Aasset/1b17b77d0cf46ab934d7adad065a31c112b4eae8.svg?AWSAccessKeyId=ASIAQ4GOSFWC3EEGZPC4&Expires=1759069790&Signature=jxfblUzewWgR%2FsHcjPE1pCgfTUA%3D&response-expires=Sun%2C%2012%20Oct%202025%2014%3A14%3A50%20GMT&x-amz-security-token=IQoJb3JpZ2luX2VjEDYaCXVzLXdlc3QtMiJHMEUCIQCwP0BHUAfTzcTCF%2F%2F86nQq8p5iMcBBF%2BP6TsbklbTV0AIgMFOkKNhUFxvu%2Fu41kmmFUx0oft8PtrJceMqiGFWhTxMqkAUIv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwwNjA1NjI3NDY3NTciDLbpx4b9miQWdxIH1yrkBLg4zt4%2FeiF%2BCMYezAchavGu1hE2pL6JQBe7lniaIMvUO4gHINIhhhIypdjTHNpUR%2FaM%2BcG7qsM4DXSWVDQpNzn1qe7S1bMQ3IxNmgxsu%2Fbao58u8Go45bxvsrkYAqX3qkXx9P%2F7kIZBiYSmnk3i4krXabDwdThN8UCETwk76%2BClokCoIRe%2F0F1Ze9phm9GhJpjC1RTp5OKYA0ex9ysLjXlcRA2JEddnDfaRttHhyD0cJSMTNpBR%2FLwwyzbwvRn8a%2Bldgyy8XJ%2F%2FEaLaaJGcGxM5hvGd9Cit2DdNn2glJ18tlYdoX9Fx5RwCHesSs%2Fx%2BKWdlcjfoArLL1I0MDGKjm9v0kB8C0%2F73r%2BcnfmdYoxWx1HGr1OMu4MgNj%2FygIbC63wYcohjnXBKkuGXzByB3sfxpZTKcP6Xowe4C%2BA%2B%2B9XFbH4DqRo8yiUWuZRn1H1xugU772lKlsT6eWVWu%2F7qRJEjBOTc4S5WLHefuB9%2BJ2GjQPCtQSdhDFl65Jku1wt9o5%2BZWCL4Mg9bbyc7pWqJL89outwEfBFs6He0oTtpqAe1WaKeHV2UaOVQRH2x0oaBmTuUL5OysQDcp80NaSK9tvSvisJvXnyoGns8zQZfNkt%2Brf2xNaScFxJYLKVq8SPV44CO%2FAWUnbUzobVg9Pas7i%2FrboinEdSnVa4Tgcgqh%2Bn3WaAeqBQzCzKXmv30H8IrPzYt1xvdGZauOzjMUeoGD0XJ8ubX0HlikxN%2BdcQc3brtt6x64bZc6O9T8pFbSXw5XkjtXY4nZO9sUq4w%2B0qPiDPVOFSIye7gjqJNmnlXScVX83t84nTD%2B7OTGBjqbAccFLwrVueFUzd9FGMvWc%2FOmTFLL3TKQd0DxjwIMCUjUli0G8H4mOJMh5zkka8IUy%2BtgvDUaBETtGmcVAbqCTTKGMoflLVfuCpH7QjSM8I3rXZMJhvWsY2jOJ5arV7xmqQnz3S8J0VpJaVqVf1buS6%2F70ziKXfHIfGCqIlUR8YljZ1CalU8gmIwBeliXBqG4UD0kkyD170GruAUY";

const ColorWidget: React.FC<ColorWidgetProps> = ({ isOpen, onClose, onColorSelect }) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTheme, setActiveTheme] = useState<'primary' | 'secondary'>('primary');

  const colorThemes = {
    primary: {
      name: 'Primary Theme',
      colors: [
        { name: 'Blue', value: '#215DFF', hex: 'rgba(33, 93, 255, 1)' },
        { name: 'Cyan', value: '#00C4FF', hex: 'rgba(0, 196, 255, 1)' },
        { name: 'Purple', value: '#8350FD', hex: 'rgba(131, 80, 253, 1)' },
      ]
    },
    secondary: {
      name: 'Secondary Theme',
      colors: [
        { name: 'Red', value: '#FB3748', hex: 'rgba(251, 55, 72, 1)' },
        { name: 'Light Gray', value: '#CACFD8', hex: 'rgba(202, 207, 216, 1)' },
        { name: 'Green', value: '#1FC16B', hex: 'rgba(31, 193, 107, 1)' },
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
      <div className="bg-[var(--background/surface/default,#ffffff)] box-border content-stretch flex flex-col gap-[30px] items-start p-[12px] relative rounded-[8px] w-[163px]">
        <div aria-hidden="true" className="absolute border border-[#e9eaec] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_54px_74px_0px_rgba(0,0,0,0.14)]" />
        <div className="content-start flex flex-col gap-[8px] items-start relative shrink-0 w-[139px]">
          {/* Primary Theme Row */}
          <div className="flex items-center gap-[8px] w-full">
            {/* Theme Selection Indicator */}
            <button
              onClick={() => handleThemeClick('primary')}
              className={`bg-[var(--bg/white-0,#ffffff)] box-border content-stretch flex gap-[2px] h-[32px] items-center justify-center p-[6px] relative rounded-[8px] shrink-0 w-[26px] transition-all ${
                activeTheme === 'primary' ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="relative shrink-0 size-[24px]">
                {activeTheme === 'primary' ? (
                  <img alt="" className="block max-w-none size-full" src={imgCheckSmall} />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
            </button>
            
            {/* Primary Theme Colors */}
            <div className="bg-[var(--bg/white-0,#ffffff)] box-border content-stretch flex gap-[2px] items-center justify-center px-[2px] py-[6px] relative rounded-[5px] shrink-0">
              <div aria-hidden="true" className="absolute border-[0.6px] border-[rgba(206,212,218,0.3)] border-solid inset-0 pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]" />
              <div className="box-border content-stretch flex gap-[var(--spacing/8,8px)] h-[20px] items-center p-[var(--spacing/0,0px)] relative shrink-0">
                {colorThemes.primary.colors.map((color, index) => (
                  <div key={index} className="content-stretch flex gap-[7px] items-center relative shrink-0">
                    <div className="overflow-clip relative shrink-0 size-[28px]">
                      <div className="absolute inset-[12.5%]">
                        <div 
                          className={`absolute inset-[-9.52%_-19.05%_-28.57%_-19.05%] rounded-full cursor-pointer hover:scale-110 transition-transform ${
                            selectedColor === color.value ? 'ring-2 ring-gray-800' : ''
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => handleColorClick(color.value)}
                          title={color.name}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Secondary Theme Row */}
          <div className="flex items-center gap-[8px] w-full">
            {/* Theme Selection Indicator */}
            <button
              onClick={() => handleThemeClick('secondary')}
              className={`bg-[var(--bg/white-0,#ffffff)] box-border content-stretch flex gap-[2px] h-[32px] items-center justify-center p-[6px] relative rounded-[8px] shrink-0 w-[26px] transition-all ${
                activeTheme === 'secondary' ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="relative shrink-0 size-[24px]">
                {activeTheme === 'secondary' ? (
                  <img alt="" className="block max-w-none size-full" src={imgCheckSmall} />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
            </button>
            
            {/* Secondary Theme Colors */}
            <div className="bg-[var(--bg/white-0,#ffffff)] box-border content-stretch flex gap-[2px] items-center justify-center px-[2px] py-[6px] relative rounded-[5px] shrink-0">
              <div aria-hidden="true" className="absolute border-[0.6px] border-[rgba(206,212,218,0.3)] border-solid inset-0 pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]" />
              <div className="box-border content-stretch flex gap-[var(--spacing/8,8px)] h-[20px] items-center p-[var(--spacing/0,0px)] relative shrink-0">
                {colorThemes.secondary.colors.map((color, index) => (
                  <div key={index} className="content-stretch flex gap-[7px] items-center relative shrink-0">
                    <div className="overflow-clip relative shrink-0 size-[28px]">
                      <div className="absolute inset-[12.5%]">
                        <div 
                          className={`absolute inset-[-16.67%_-33.33%_-50%_-33.33%] rounded-full cursor-pointer hover:scale-110 transition-transform ${
                            selectedColor === color.value ? 'ring-2 ring-gray-800' : ''
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => handleColorClick(color.value)}
                          title={color.name}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Selected Color Display */}
        {selectedColor && (
          <div className="w-full text-center">
            <p className="text-xs text-gray-600 mb-1">Selected Color:</p>
            <div className="flex items-center justify-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-xs font-mono text-gray-800">{selectedColor}</span>
            </div>
          </div>
        )}
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ColorWidget;
