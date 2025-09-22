"use client";

import { motion } from "framer-motion";
import { Tab } from "@headlessui/react";
import React, { Fragment, useState, useMemo } from "react";
import StayCard2 from "@/components/StayCard2/StayCard2";
import { SessionType } from "@prisma/client";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { StayCardData } from "../types";
import { CATEGORY_CONFIG } from "../constants";
import Pagination from "@/shared/Pagination";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PAGINATION_LIMITS } from "./SectionGridFilterCard";

interface ClientSideGridFilterProps {
  initialData: StayCardData[];
  className?: string;
  isLoading?: boolean;
}

export default function ClientSideGridFilter({ 
  initialData, 
  className = "",
  isLoading = false
}: ClientSideGridFilterProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Responsive pagination limits
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px)');
  
  const itemsPerPage = useMemo(() => {
    if (showAll) return initialData.length;
    if (isDesktop) return PAGINATION_LIMITS.DESKTOP;
    if (isTablet) return PAGINATION_LIMITS.TABLET;
    return PAGINATION_LIMITS.MOBILE;
  }, [isDesktop, isTablet, showAll, initialData.length]);

  // Calculate session counts
  const sessionCounts = useMemo(() => {
    const counts = new Map<SessionType | undefined, number>();
    CATEGORY_CONFIG.forEach(category => {
      counts.set(category.type, 0);
    });
    counts.set(undefined, initialData.length);
    initialData.forEach(session => {
      if (session.sessionType) {
        const currentCount = counts.get(session.sessionType) || 0;
        counts.set(session.sessionType, currentCount + 1);
      }
    });
    return counts;
  }, [initialData]);

  // Filter and paginate sessions
  const { paginatedSessions, totalPages } = useMemo(() => {
    const selectedType = CATEGORY_CONFIG[activeTab].type;
    const filtered = selectedType 
      ? initialData.filter(session => session.sessionType === selectedType)
      : initialData;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    return {
      paginatedSessions: filtered.slice(start, end),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }, [activeTab, initialData, currentPage, itemsPerPage]);

  // Reset pagination when tab changes
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <LoadingSkeleton 
        itemCount={itemsPerPage} 
        className={`listingSection__wrap ${className}`}
      />
    );
  }

  return (
    <div className={`listingSection__wrap ${className}`}>
      <Tab.Group onChange={handleTabChange}>
        <div className="sticky top-[80px] z-10 bg-white dark:bg-neutral-900">
          <Tab.List className="flex space-x-1 rounded-xl bg-neutral-100/70 p-1 dark:bg-neutral-800/70 backdrop-blur-sm overflow-x-auto scrollbar-hide">
            {CATEGORY_CONFIG.map((category, index) => {
              const count = sessionCounts.get(category.type) || 0;
              return (
                <Tab
                  key={category.name}
                  disabled={index !== 0 && count === 0}
                  className={({ selected, disabled }) => `
                    flex items-center justify-center space-x-1 
                    min-w-[80px] sm:min-w-fit
                    w-full rounded-lg py-2.5 px-2.5 sm:px-4
                    text-[12px] sm:text-sm font-medium 
                    whitespace-nowrap
                    transition-all duration:150 ease-in-out
                    ${disabled ? 
                      'opacity-50 cursor-not-allowed text-neutral-400 dark:text-neutral-600' : 
                      selected
                        ? "bg-white text-neutral-900 shadow dark:bg-neutral-900 dark:text-white"
                        : "text-neutral-600 hover:bg-white/[0.12] hover:text-neutral-900 dark:text-neutral-400"
                    }
                  `}
                >
                  <span className="block md:hidden">
                    {category.shortName}
                  </span>
                  <span className="hidden md:block">
                    {category.name}
                  </span>
                  
                  {count > 0 && (
                    <span className="ml-1.5 text-xs">
                      ({count})
                    </span>
                  )}
                </Tab>
              );
            })}
          </Tab.List>
        </div>

        <Tab.Panels>
          {CATEGORY_CONFIG.map((_, index) => (
            <Tab.Panel key={index}>
              <motion.div 
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {paginatedSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <StayCard2 data={session} />
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
      
      {paginatedSessions.length > itemsPerPage && !showAll ? (
        <div className="flex flex-col items-center gap-4 mt-12">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Show All Sessions ({paginatedSessions.length})
          </button>
          <span className="text-sm text-neutral-500">
            or
          </span>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        showAll && (
          <button
            onClick={() => {
              setShowAll(false);
              setCurrentPage(1);
            }}
            className="mt-12 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Show Less
          </button>
        )
      )}
    </div>
  );
} 