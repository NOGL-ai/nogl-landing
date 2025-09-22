'use client';

import React, { useState } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  categories: string[];
  languages: string[];
  onClose?: () => void;
  isMobile?: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  onFilterChange, 
  categories, 
  languages,
  onClose,
  isMobile = false 
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<number[]>([0, 500]);

  // Reset all filters
  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedLanguages([]);
    setMinRating(0);
    setPriceRange([0, 500]);
  };

  const handleFilterApply = () => {
    onFilterChange({
      categories: selectedCategories,
      languages: selectedLanguages,
      minRating,
      priceRange,
    });
    if (isMobile && onClose) onClose();
  };

  return (
    <motion.div 
      initial={{ x: isMobile ? '100%' : -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isMobile ? '100%' : -20, opacity: 0 }}
      className={`
        filter-sidebar overflow-y-auto
        ${isMobile 
          ? 'fixed inset-y-0 right-0 w-full max-w-sm shadow-xl' 
          : 'w-72'}
        p-6 bg-white dark:bg-neutral-800 border-r dark:border-neutral-700
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        {isMobile && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <span 
              key={category}
              className="px-3 py-1 text-sm bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-full flex items-center gap-1"
            >
              {category}
              <XMarkIcon 
                className="w-4 h-4 cursor-pointer"
                onClick={() => setSelectedCategories(prev => 
                  prev.filter(item => item !== category)
                )}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="filter-section mb-6">
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label 
              key={category} 
              className="flex items-center hover:bg-neutral-50 dark:hover:bg-neutral-700 p-2 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={(e) => {
                  const value = category;
                  setSelectedCategories(prev =>
                    prev.includes(value)
                      ? prev.filter(item => item !== value)
                      : [...prev, value]
                  );
                }}
                className="w-4 h-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500"
              />
              <span className="ml-3 text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="filter-section mb-6">
        <h4 className="font-medium mb-3">Languages</h4>
        <div className="space-y-2">
          {languages.map((language) => (
            <label 
              key={language} 
              className="flex items-center hover:bg-neutral-50 dark:hover:bg-neutral-700 p-2 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedLanguages.includes(language)}
                onChange={(e) => {
                  const value = language;
                  setSelectedLanguages(prev =>
                    prev.includes(value)
                      ? prev.filter(item => item !== value)
                      : [...prev, value]
                  );
                }}
                className="w-4 h-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500"
              />
              <span className="ml-3 text-sm">{language}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="filter-section mb-6">
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center gap-1 min-w-[80px]">
            <StarIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">{minRating}</span>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section mb-6">
        <h4 className="font-medium mb-3">Hourly Rate (€)</h4>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])
              }
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], parseFloat(e.target.value) || 0])
              }
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-neutral-800 border-t dark:border-neutral-700">
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            Reset All
          </button>
          <button
            onClick={handleFilterApply}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterSidebar; 