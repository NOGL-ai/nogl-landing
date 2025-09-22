'use client';

import { useState, useEffect } from 'react';
import Pagination from "@/shared/Pagination";
import ExperiencesCard from "@/components/ExpertCard/ExperiencesCard";
import { ExpertDataType } from "@/data/types";

interface Props {
  initialData: ExpertDataType[];
  className?: string;
  errorMessage?: string;
}

const ITEMS_PER_PAGE = 12;

export default function SectionGridFilterCard({ initialData, className = "", errorMessage = "" }: Props) {
  const [experts, setExperts] = useState<ExpertDataType[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredExperts, setFilteredExperts] = useState<ExpertDataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setExperts(initialData);
  }, [initialData]);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredExperts(experts);
    } else {
      setFilteredExperts(
        experts.filter(expert => 
          expert.categoryName === activeCategory || 
          expert.expertise.includes(activeCategory)
        )
      );
    }
  }, [activeCategory, experts]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredExperts.length / ITEMS_PER_PAGE);

  // Get current page items
  const currentExperts = filteredExperts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const categories = [
    'All',
    'Mock Interview',
    'Career Guidance',
    'Software',
    'Product',
    'Data',
    'Study Abroad',
    'Others',
  ];

  return (
    <div className={`nc-SectionGridFilterCard ${className}`}>
      {/* Category Filters - Always visible */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4">
        <button className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
          </span>
        </button>
        <button className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort
          </span>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full transition-all ${
              activeCategory === category
                ? 'bg-black text-white'
                : 'bg-white hover:bg-neutral-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Error Message or No Results */}
      {(errorMessage || filteredExperts.length === 0) && (
        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
          <h3 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
            {errorMessage || (
              activeCategory === 'All' 
                ? 'No Experts Available' 
                : `No experts found in ${activeCategory}`
            )}
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            {errorMessage 
              ? 'Please try again later or contact support if the problem persists.'
              : 'Check back later for new experts or try a different category.'}
          </p>
        </div>
      )}

      {/* Expert Cards Grid */}
      {!errorMessage && filteredExperts.length > 0 && (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentExperts.map((expert) => (
            <ExperiencesCard 
              key={expert.id} 
              data={expert}
            />
          ))}
        </div>
      )}

      {/* Pagination - Only show if there are experts and no error */}
      {!errorMessage && filteredExperts.length > 0 && (
        <div className="flex mt-16 justify-center items-center">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
