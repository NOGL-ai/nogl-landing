import type { ReactNode } from "react";

import { statusClasses } from "@/lib/competitors/constants";
import type { CompetitorRow, CompetitorsResponse } from "@/lib/competitors/types";
import { formatRelativeTime, getBaseUrl } from "@/lib/competitors/utils";
import { FEATURES } from "@/lib/featureFlags";

async function getCompetitors(): Promise<{
  competitors: CompetitorRow[];
  errorMessage: string | null;
}> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/competitors`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        competitors: [],
        errorMessage: `HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as CompetitorsResponse;

    return {
      competitors: Array.isArray(data.competitors) ? data.competitors : [],
      errorMessage: null,
    };
  } catch {
    return {
      competitors: [],
      errorMessage: "Network error",
    };
  }
}

function PageShell({
  activeCompetitorCount,
  children,
}: {
  activeCompetitorCount: number;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:flex-row">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-800 sm:text-xl">
                  Competitors
                </h1>
                {activeCompetitorCount > 0 ? (
                  <div
                    aria-label={`${activeCompetitorCount} active competitors`}
                    className="flex max-w-[180px] flex-wrap items-center gap-1.5"
                  >
                    {Array.from({ length: activeCompetitorCount }).map((_, index) => (
                      <span
                        key={index}
                        className="h-2 w-2 rounded-full bg-gray-400"
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <a
                href="./add-ecommerce"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
              >
                Add Competitor
              </a>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

function StateCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">{title}</h2>
          <div className="mt-2 text-sm leading-relaxed text-gray-600">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CompetitorRow["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

function CompetitorsTable({ competitors }: { competitors: CompetitorRow[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="pb-4 pr-6">Name/Domain</th>
              <th className="pb-4 pr-6">Products</th>
              <th className="pb-4 pr-6">Status</th>
              <th className="pb-4 pr-6">Last Scraped</th>
              <th className="pb-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {competitors.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="py-4 pr-6">
                  <a
                    href={`./competitor/${row.id}`}
                    className="font-medium text-gray-900 transition-colors duration-200 hover:text-blue-600"
                  >
                    {row.name}
                  </a>
                  <p className="mt-1 text-sm text-gray-500">{row.domain}</p>
                </td>
                <td className="py-4 pr-6 text-sm tabular-nums text-gray-700">
                  {row.productCount}
                </td>
                <td className="py-4 pr-6">
                  <StatusBadge status={row.status} />
                </td>
                <td className="py-4 pr-6 text-sm text-gray-600">
                  {formatRelativeTime(row.lastScrapedAt)}
                </td>
                <td className="py-4 text-sm">
                  <a
                    href={`./competitor/${row.id}`}
                    className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function Page() {
  if (!FEATURES.COMPETITOR_API) {
    return (
      <PageShell activeCompetitorCount={0}>
        <StateCard
          icon={
            <svg
              className="h-7 w-7 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 15h8M8 11h8M8 7h8M4.75 5.75h.5v.5h-.5zm0 4h.5v.5h-.5zm0 4h.5v.5h-.5zM4 4h16v16H4z"
              />
            </svg>
          }
          title="Competitor tracking coming soon"
          description="Competitor tracking is not enabled in this environment yet. Check back once the feature flag is turned on."
        />
      </PageShell>
    );
  }

  const { competitors, errorMessage } = await getCompetitors();
  const activeCompetitorCount = competitors.filter(
    (row) => row.status === "ACTIVE"
  ).length;

  if (errorMessage) {
    return (
      <PageShell activeCompetitorCount={activeCompetitorCount}>
        <StateCard
          icon={
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 9v3.75m0 3h.008v.008H12v-.008Zm8.25-.75L13.3 4.5a1.5 1.5 0 0 0-2.6 0L3.75 18a1.5 1.5 0 0 0 1.3 2.25h13.9A1.5 1.5 0 0 0 20.25 18Z"
              />
            </svg>
          }
          title="Could not load competitors"
          description={<p>{errorMessage}</p>}
        />
      </PageShell>
    );
  }

  if (competitors.length === 0) {
    return (
      <PageShell activeCompetitorCount={activeCompetitorCount}>
        <StateCard
          icon={
            <svg
              className="h-7 w-7 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 7.5h16M7 4.5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"
              />
            </svg>
          }
          title="No competitors tracked yet"
          description={
            <a
              href="./add-ecommerce"
              className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
            >
              Add your first competitor
            </a>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell activeCompetitorCount={activeCompetitorCount}>
      <CompetitorsTable competitors={competitors} />
    </PageShell>
  );
}
