"use client";

import { ChevronRight } from '@untitledui/icons';
import Link from "next/link";
import { useTranslations } from "next-intl";

type CompanyBreadcrumbProps = {
  companyName: string;
  lang: string;
};

export function CompanyBreadcrumb({ companyName, lang }: CompanyBreadcrumbProps) {
  const t = useTranslations("companies");

  return (
    <nav aria-label="breadcrumb" className="border-b border-border-primary bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/60">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href={`/${lang}/companies`}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {t("explorer")}
            </Link>
          </li>
          <li className="text-text-tertiary">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium text-text-primary">{companyName}</span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
