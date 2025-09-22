"use client";

import React, { Fragment, useState, useMemo } from "react";
import { StayCardData } from "../types";
import { motion } from "framer-motion";
import { Tab } from "@headlessui/react";
import StayCard2 from "@/components/StayCard2/StayCard2";
import { SessionType } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_CONFIG } from "../constants";

interface ClientSideFilterProps {
  initialData: StayCardData[];
  expertId: string;
  isLoading?: boolean;
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div>
    <div className="sticky top-[80px] z-10 bg-white dark:bg-neutral-900">
      <div className="flex space-x-1 rounded-xl bg-neutral-100/70 p-1 dark:bg-neutral-800/70">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton 
            key={item}
            className="h-10 w-full rounded-lg"
          />
        ))}
      </div>
    </div>
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 md:gap-7">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Skeleton 
          key={item}
          className="h-[250px] sm:h-[300px] w-full rounded-2xl"
        />
      ))}
    </div>
  </div>
);

const ClientSideFilter = ({ 
  initialData, 
  expertId,
  isLoading = false
}: ClientSideFilterProps) => {
  const [activeTab, setActiveTab] = useState(0);
  
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

  // Filter sessions based on active tab
  const filteredSessions = useMemo(() => {
    const selectedType = CATEGORY_CONFIG[activeTab].type;
    if (!selectedType) return initialData;
    return initialData.filter(session => session.sessionType === selectedType);
  }, [activeTab, initialData]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Tab.Group onChange={setActiveTab}>
      <div className="sticky top-[80px] z-10 bg-white dark:bg-neutral-900">
        <Tab.List className="flex space-x-0.5 xs:space-x-1 rounded-xl bg-neutral-100/70 p-0.5 xs:p-1 sm:p-1.5 dark:bg-neutral-800/70">
          {CATEGORY_CONFIG.map((category, index) => (
            <Tab
              key={category.name}   
              disabled={index !== 0 && (sessionCounts.get(category.type) || 0) === 0}
              className={({ selected, disabled }) => `
                w-full rounded-lg 
                px-1 xs:px-1.5 sm:px-2.5 md:px-4
                py-1 xs:py-1.5 sm:py-2.5 md:py-3
                text-[10px] xs:text-[11px] sm:text-sm md:text-base font-medium
                flex items-center justify-center gap-0.25 xs:gap-0.5 sm:gap-1
                transition-all duration-200
                ${disabled ? 
                  'opacity-50 cursor-not-allowed text-neutral-400 dark:text-neutral-600' : 
                  selected ?
                    'bg-white text-neutral-900 shadow dark:bg-neutral-900 dark:text-white' :
                    'text-neutral-600 hover:bg-white/[0.12] hover:text-neutral-900 dark:text-neutral-400'
                }
              `}
            >
              <div className="flex items-center">
                {/* Mobile view (below md breakpoint) */}
                <span className="block md:hidden whitespace-nowrap">
                  {category.shortName}
                </span>
                {/* Desktop view (md and above) */}
                <span className="hidden md:block whitespace-nowrap">
                  {category.name}
                </span>
                {(sessionCounts.get(category.type) || 0) > 0 && (
                  <span className="ml-0.5 xs:ml-1 text-[8px] xs:text-[10px] sm:text-xs">
                    ({sessionCounts.get(category.type)})
                  </span>
                )}
              </div>
            </Tab>
          ))}
        </Tab.List>
      </div>

      <Tab.Panels className="mt-6">
        {CATEGORY_CONFIG.map((_, idx) => (
          <Tab.Panel key={idx}>
            <motion.div 
              className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-3 md:gap-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {filteredSessions.map((session) => (
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
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default ClientSideFilter;