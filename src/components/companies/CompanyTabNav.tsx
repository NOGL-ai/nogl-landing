"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";

type TabDef = {
  key: string;
  labelKey:
    | "tabs.overview"
    | "tabs.events"
    | "tabs.pricing"
    | "tabs.pivot"
    | "tabs.assets";
  icon: React.ElementType | null;
};

const TABS: TabDef[] = [
  { key: "overview", labelKey: "tabs.overview", icon: null },
  { key: "events", labelKey: "tabs.events", icon: null },
  { key: "pricing", labelKey: "tabs.pricing", icon: null },
  { key: "pivot", labelKey: "tabs.pivot", icon: LayoutGrid },
  { key: "assets", labelKey: "tabs.assets", icon: null },
];

type CompanyTabNavProps = {
  slug: string;
  lang: string;
};

export function CompanyTabNav({ slug, lang }: CompanyTabNavProps) {
  const pathname = usePathname();
  const t = useTranslations("companies");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex h-auto flex-wrap justify-start rounded-2xl bg-muted/60 p-1">
        {TABS.map((tab) => {
          const href = `/${lang}/companies/${slug}/${tab.key}`;
          const isActive = pathname === href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.key}
              href={href}
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
