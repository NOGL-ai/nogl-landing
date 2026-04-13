"use client";

import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CompanyOverviewResponse } from "@/types/company";
import { AssetsTab } from "./tabs/AssetsTab";
import { EventsTab } from "./tabs/EventsTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { PricingTab } from "./tabs/PricingTab";

type CompanyTabsProps = {
  slug: string;
  initialData: CompanyOverviewResponse;
};

const TABS = ["overview", "pricing", "events", "assets"] as const;
type TabKey = (typeof TABS)[number];

function getInitialTab(): TabKey {
  if (typeof window === "undefined") {
    return "overview";
  }

  const hash = window.location.hash.replace("#", "");
  return TABS.includes(hash as TabKey) ? (hash as TabKey) : "overview";
}

export function CompanyTabs({ slug, initialData }: CompanyTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    const syncFromHash = () => {
      setActiveTab(getInitialTab());
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  const handleTabChange = (value: string) => {
    const nextTab = value as TabKey;
    setActiveTab(nextTab);
    window.history.pushState(null, "", `#${nextTab}`);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <TabsList className="h-auto flex-wrap justify-start rounded-2xl bg-muted/60 p-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-xl px-4 py-2 text-sm font-medium capitalize"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <TabsContent value="overview" forceMount>
          <OverviewTab data={initialData} />
        </TabsContent>
        <TabsContent value="pricing" forceMount>
          <PricingTab slug={slug} active={activeTab === "pricing"} />
        </TabsContent>
        <TabsContent value="events" forceMount>
          <EventsTab slug={slug} active={activeTab === "events"} />
        </TabsContent>
        <TabsContent value="assets" forceMount>
          <AssetsTab slug={slug} active={activeTab === "assets"} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
