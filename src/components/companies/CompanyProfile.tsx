"use client";

import type { ReactNode } from "react";
import { ExternalLink, Facebook, Instagram, Music2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CompetitorAvatarStack } from "@/components/companies/profile/CompetitorAvatarStack";
import { DatasetQualityCallout } from "@/components/companies/profile/DatasetQualityCallout";
import type {
  CompanyCompetitorPreviewDTO,
  CompanyDatasetQualityUiStatus,
  CompanyDTO,
  CompanySnapshotDTO,
  CompanySocialLinksDTO,
} from "@/types/company";

type CompanyProfileProps = {
  company: CompanyDTO;
  snapshot: CompanySnapshotDTO;
  socials: CompanySocialLinksDTO;
  competitors: CompanyCompetitorPreviewDTO[];
  datasetQualityUiStatus: CompanyDatasetQualityUiStatus;
};

function ProfileCol({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-[calc(50%-8px)] flex-1 sm:min-w-[calc(33.33%-12px)] lg:min-w-0 lg:pl-6 lg:first:pl-0">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function DataTypesBadge() {
  const t = useTranslations("companies");
  const icons: { icon: ReactNode; label: string }[] = [
    {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
        </svg>
      ),
      label: t("dataTypeProducts"),
    },
    {
      icon: <span className="text-[11px] font-bold">$</span>,
      label: t("dataTypePricing"),
    },
    {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      ),
      label: t("dataTypeSocial"),
    },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {icons.map((item) => (
        <div
          key={item.label}
          title={item.label}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted text-xs text-muted-foreground"
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: ReactNode;
}) {
  const cls = href
    ? "text-muted-foreground/70 hover:text-foreground transition-colors"
    : "text-muted-foreground/30 cursor-default";
  const content = (
    <span className={cls} title={label}>
      {children}
    </span>
  );
  if (!href) return content;
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cls} title={label}>
      {children}
    </a>
  );
}

export function CompanyProfile({
  company,
  snapshot,
  socials,
  competitors,
  datasetQualityUiStatus,
}: CompanyProfileProps) {
  const t = useTranslations("companies");
  const locale = useLocale();

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return t("notAvailable");
    return new Date(dateStr).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const dataSinceDisplay = snapshot.data_since ?? company.createdAt;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Company Profile</h3>
        {company.industry && (
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{company.industry}</span>
          </div>
        )}
      </div>

      {/* Horizontal columns — 2-col on mobile, 3-col on sm, single row at lg+ with dividers */}
      <div className="flex flex-wrap gap-x-4 gap-y-4 lg:flex-nowrap lg:gap-x-0 lg:divide-x lg:divide-border">
        {/* Domain */}
        <ProfileCol label={t("domain")}>
          <a
            href={`https://${company.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="truncate max-w-[140px]">{company.domain}</span>
            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
          </a>
        </ProfileCol>

        {/* Data Since */}
        <ProfileCol label={t("dataSince")}>
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(dataSinceDisplay)}</span>
          </div>
        </ProfileCol>

        {/* Data Available */}
        <ProfileCol label={t("dataAvailable")}>
          <DataTypesBadge />
        </ProfileCol>

        {/* Socials */}
        <ProfileCol label={t("socials")}>
          <div className="flex items-center gap-2">
            <SocialIcon href={socials.facebook} label="Facebook">
              <Facebook className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={socials.instagram} label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={socials.tiktok} label="TikTok">
              <Music2 className="h-4 w-4" />
            </SocialIcon>
          </div>
        </ProfileCol>

        {/* Dataset Quality */}
        <ProfileCol label={t("overview.datasetQualityLabel")}>
          <DatasetQualityCallout variant={datasetQualityUiStatus} />
        </ProfileCol>

        {/* Competitors */}
        <ProfileCol label={t("competitors")}>
          {competitors.length > 0 ? (
            <CompetitorAvatarStack competitors={competitors} compareLabel={t("compareQuestion")} />
          ) : (
            <span className="text-xs text-muted-foreground">{t("noCompetitorsTracked")}</span>
          )}
        </ProfileCol>
      </div>
    </div>
  );
}
