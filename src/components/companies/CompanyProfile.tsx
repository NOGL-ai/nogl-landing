"use client";

import { ExternalLink, Facebook, Instagram, Music2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CompetitorAvatarStack } from "@/components/companies/profile/CompetitorAvatarStack";
import { DatasetQualityCallout } from "@/components/companies/profile/DatasetQualityCallout";
import { ProfileLabeledCard } from "@/components/companies/profile/ProfileLabeledCard";
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

function DataTypesBadge() {
  const t = useTranslations("companies");
  const icons = [
    { icon: "✦", label: t("dataTypeProducts") },
    { icon: "$", label: t("dataTypePricing") },
    { icon: "📈", label: t("dataTypeEvents") },
    { icon: "🌍", label: t("dataTypeSocial") },
  ];

  return (
    <div className="flex gap-1">
      {icons.map((item) => (
        <div
          key={item.label}
          title={item.label}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg-secondary text-xs text-text-secondary"
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <span className="text-text-quaternary opacity-40" aria-disabled title={label}>
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-text-tertiary transition-colors hover:text-text-primary"
      title={label}
    >
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
  const websiteUrl = `https://${company.domain}`;

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary">{t("profile")}</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-secondary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium">{company.industry || t("defaultIndustry")}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ProfileLabeledCard label={t("domain")}>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-text-primary transition-colors hover:text-text-brand"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span>{company.domain}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </ProfileLabeledCard>

          <ProfileLabeledCard label={t("dataAvailable")}>
            <div className="flex flex-wrap gap-2">
              <DataTypesBadge />
            </div>
          </ProfileLabeledCard>

          <ProfileLabeledCard label={t("socials")}>
            <div className="flex gap-3">
              <SocialIconLink href={socials.facebook} label="Facebook">
                <Facebook className="h-5 w-5" />
              </SocialIconLink>
              <SocialIconLink href={socials.instagram} label="Instagram">
                <Instagram className="h-5 w-5" />
              </SocialIconLink>
              <SocialIconLink href={socials.tiktok} label="TikTok">
                <Music2 className="h-5 w-5" />
              </SocialIconLink>
            </div>
          </ProfileLabeledCard>

          <ProfileLabeledCard label={t("datasetQuality")}>
            <DatasetQualityCallout variant={datasetQualityUiStatus} />
          </ProfileLabeledCard>
        </div>

        <div className="space-y-4">
          <ProfileLabeledCard label={t("dataSince")}>
            <p className="text-sm text-text-primary">{formatDate(dataSinceDisplay)}</p>
          </ProfileLabeledCard>

          <ProfileLabeledCard label={t("competitors")}>
            {competitors.length > 0 ? (
              <CompetitorAvatarStack competitors={competitors} compareLabel={t("compareQuestion")} />
            ) : (
              <p className="text-xs text-text-tertiary">{t("noCompetitorsTracked")}</p>
            )}
          </ProfileLabeledCard>
        </div>
      </div>
    </div>
  );
}
