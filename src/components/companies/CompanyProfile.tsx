"use client";

// eslint-disable-next-line no-restricted-imports -- icon has no @untitledui/icons equivalent; keep in lucide-react until UUI ships it
import { Facebook, Instagram } from 'lucide-react';
import { LinkExternal01 as ExternalLink, MusicNote01 as Music2 } from '@untitledui/icons';
import type { ReactNode } from "react";
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
      <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
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
          className="flex h-6 w-6 items-center justify-center rounded-full border border-border-primary bg-bg-secondary text-xs text-text-tertiary"
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 4.991 3.185 9.252 7.688 10.774v-7.618h-2.31v-3.156h2.31V9.413c0-2.282 1.359-3.543 3.44-3.543.997 0 2.038.178 2.038.178v2.24h-1.148c-1.13 0-1.483.702-1.483 1.42v1.706h2.523l-.403 3.156h-2.12v7.618C20.815 21.325 24 17.064 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
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
    ? "text-text-tertiary/70 hover:text-text-primary transition-colors"
    : "text-text-tertiary/30 cursor-default";
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
    <div className="rounded-xl border border-border-primary bg-bg-primary p-5 shadow-xs">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Company Profile</h3>
        {company.industry && (
          <div className="flex items-center gap-1.5 rounded-full border border-border-primary bg-bg-secondary px-2.5 py-1 text-xs text-text-secondary">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{company.industry}</span>
          </div>
        )}
      </div>

      {/* Horizontal columns — 2-col on mobile, 3-col on sm, single row at lg+ with dividers */}
      <div className="flex flex-wrap gap-x-4 gap-y-4 lg:flex-nowrap lg:gap-x-0 lg:divide-x lg:divide-border-primary">
        {/* Domain */}
        <ProfileCol label={t("domain")}>
          <a
            href={`https://${company.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary hover:text-text-brand transition-colors"
          >
            <svg className="h-3.5 w-3.5 shrink-0 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="truncate max-w-[140px]">{company.domain}</span>
            <ExternalLink className="h-3 w-3 shrink-0 text-text-tertiary" />
          </a>
        </ProfileCol>

        {/* Data Since */}
        <ProfileCol label={t("dataSince")}>
          <div className="flex items-center gap-1.5 text-sm text-text-primary">
            <svg className="h-3.5 w-3.5 shrink-0 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <FacebookIcon />
            </SocialIcon>
            <SocialIcon href={socials.instagram} label="Instagram">
              <InstagramIcon />
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
            <span className="text-xs text-text-tertiary">{t("noCompetitorsTracked")}</span>
          )}
        </ProfileCol>
      </div>
    </div>
  );
}
