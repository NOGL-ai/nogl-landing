"use client";

import { Tab } from "@headlessui/react";
import React, { Fragment, Suspense } from "react";
import SessionsSection from "./SessionsSection";
import ReviewSection from "@/components/Common/sections/ReviewSection";
import CommunitySection from "@/components/Common/sections/CommunitySection";
import { Skeleton } from "@/components/ui/skeleton";

interface TabSectionProps {
  initialSessions: any[];
  expertId: string;
}

// Loading fallback component
const TabSectionLoading = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full rounded-xl" />
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[400px] rounded-xl" />
      ))}
    </div>
  </div>
);

const TabSection: React.FC<TabSectionProps> = ({ initialSessions, expertId }) => {
  const tabs = [
    {
      name: "Sessions",
      component: <SessionsSection initialSessions={initialSessions} expertId={expertId} />
    },
    {
      name: "Community",
      component: <CommunitySection memberCount={124} discussions={45} />
    },
    {
      name: "Reviews",
      component: <ReviewSection totalReviews={23} />
    }
  ];

  return (
    <div className="relative z-0">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-neutral-100/70 p-1 dark:bg-neutral-800/70">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${
                  selected
                    ? "bg-white text-neutral-900 shadow dark:bg-neutral-900 dark:text-white"
                    : "text-neutral-600 hover:bg-white/[0.12] hover:text-neutral-900 dark:text-neutral-400"
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-6">
          {tabs.map((tab, idx) => (
            <Tab.Panel key={idx}>
              <Suspense fallback={<TabSectionLoading />}>
                {tab.component}
              </Suspense>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default TabSection; 