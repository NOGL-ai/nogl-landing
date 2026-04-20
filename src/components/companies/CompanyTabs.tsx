"use client";
import { LayoutGrid01 as LayoutGrid } from '@untitledui/icons';


import { LayoutGrid01 as LayoutGrid } from '@untitledui/icons';


import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CompanyOverviewResponse } from "@/types/company";
import { AssetsTab } from "./tabs/AssetsTab";
import { EventsTab } from "./tabs/EventsTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { PivotTab } from "./tabs/PivotTab";
import { PricingTab } from "./tabs/PricingTab";
import { RatingsTab } from "./tabs/RatingsTab";

type CompanyTabsProps = {
  slug: string;
  initialData: CompanyOverviewResponse;
};

const TAB_DEFS = [
  { value: "overview", labelKey: "tabs.overview" as const, icon: null },
  { value: "events", labelKey: "tabs.events" as const, icon: null },
  { value: "pricing", labelKey: "tabs.pricing" as const, icon: null },
  { value: "ratings", labelKey: "tabs.ratings" as const, icon: null },
  { value: "pivot", labelKey: "tabs.pivot" as const, icon: LayoutGrid },
  { value: "assets", labelKey: "tabs.assets" as const, icon: null },
] as const;

type TabKey = (typeof TAB_DEFS)[number]["value"];

const TAB_IDS: TabKey[] = [...TAB_DEFS.map((d) => d.value)];

function getInitialTab(): TabKey {
  if (typeof window === "undefined") {
    return "overview";
  }

  const hash = window.location.hash.replace("#", "");
  return TAB_IDS.includes(hash as TabKey) ? (hash as TabKey) : "overview";
}

export function CompanyTabs({ slug, initialData }: CompanyTabsProps) {
  const t = useTranslations("companies");
  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    typeof window !== "undefined" ? getInitialTab() : "overview",
  );

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
          {TAB_DEFS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-xl px-4 py-2 text-sm font-medium"
            >
              {tab.icon ? <tab.icon className="mr-2 h-4 w-4" /> : null}
              {t(tab.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <TabsContent value="overview" forceMount>
          <OverviewTab data={initialData} />
        </TabsContent>
        <TabsContent value="events" forceMount>
          <EventsTab slug={slug} active={activeTab === "events"} />
        </TabsContent>
        <TabsContent value="pricing" forceMount>
          <PricingTab slug={slug} active={activeTab === "pricing"} />
        </TabsContent>
        <TabsContent value="ratings" forceMount>
          <RatingsTab active={activeTab === "ratings"} />
        </TabsContent>
        <TabsContent value="pivot" forceMount>
          <PivotTab slug={slug} active={activeTab === "pivot"} />
        </TabsContent>
        <TabsContent value="assets" forceMount>
          <AssetsTab slug={slug} active={activeTab === "assets"} />
        </TabsContent>
      </div>
    </Tabs>
  );
}