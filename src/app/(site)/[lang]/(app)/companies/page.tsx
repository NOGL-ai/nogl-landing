import { Search, Sparkles, Telescope } from "lucide-react";

import { listCompanies } from "@/lib/companies";
import { formatRelativeTime } from "@/lib/competitors/utils";
import { extractDomainFromUrl, generateLogoUrl } from "@/lib/logoService";
import { TrackCompetitorTrigger } from "./track-competitor-trigger";

function getLogoUrl(domain: string): string {
  const normalizedDomain = extractDomainFromUrl(domain) ?? domain;
  return (
    generateLogoUrl(normalizedDomain, { format: "png", size: 128 }) ??
    "https://img.logo.dev/logo.dev?format=png&size=128"
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const search = resolvedSearchParams?.search?.trim() ?? "";
  let companies = [] as Awaited<ReturnType<typeof listCompanies>>;
  let loadError: string | null = null;

  try {
    companies = await listCompanies(search);
  } catch (error) {
    console.error("[companies-page] failed to load companies:", error);
    loadError = "Could not load companies right now.";
  }

  const featuredCompanies = companies.slice(0, 18);
  const trackedCompanies = companies.filter((company) => company.trackedCompetitorId);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,_#ffffff,_#f8fafc)]" />
            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Company Explorer
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                    Explore the companies inside your camera market universe.
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
                    Search brands, discover who exists in the market, and decide which companies should move into your tracked competitor workflow.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="./competitor"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    Open Tracked Competitors
                  </a>
                  <TrackCompetitorTrigger />
                </div>
              </div>

              <form className="mt-8">
                <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-[0_16px_40px_rgba(59,130,246,0.12)] backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="search"
                    name="search"
                    defaultValue={search}
                    placeholder="Search camera brands, stores, or domains"
                    className="flex-1 border-none bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {featuredCompanies.map((company) => (
                  <a
                    key={company.key}
                    href={company.trackedCompetitorId ? `./competitor/${company.trackedCompetitorId}` : company.website}
                    target={company.trackedCompetitorId ? undefined : "_blank"}
                    rel={company.trackedCompetitorId ? undefined : "noreferrer"}
                    className="group rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-gray-50">
                      <img
                        src={getLogoUrl(company.domain)}
                        alt={`${company.name} logo`}
                        className="max-h-12 max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {company.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {company.domain}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Telescope className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Companies in Scope</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {loadError
                ? loadError
                : search
                ? `Showing ${companies.length} companies matching "${search}".`
                : `Showing ${companies.length} companies from the current market dataset.`}
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Products</th>
                    <th className="px-4 py-3">Last Seen</th>
                    <th className="px-4 py-3">Tracking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {companies.slice(0, 24).map((company) => (
                    <tr key={company.key} className="align-top">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white">
                            <img
                              src={getLogoUrl(company.domain)}
                              alt={`${company.name} logo`}
                              className="max-h-8 max-w-8 object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-gray-500 transition-colors hover:text-blue-600"
                            >
                              {company.domain}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm tabular-nums text-gray-700">
                        {company.productCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatRelativeTime(company.lastSeenAt)}
                      </td>
                      <td className="px-4 py-4">
                        {company.trackedCompetitorId ? (
                          <a
                            href={`./competitor/${company.trackedCompetitorId}`}
                            className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                          >
                            Tracked
                          </a>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                            Not tracked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Tracked Competitors</h2>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                The companies already promoted into your active competitor workflow.
              </p>
              <div className="mt-5 space-y-3">
                {trackedCompanies.slice(0, 8).map((company) => (
                  <a
                    key={company.key}
                    href={`./competitor/${company.trackedCompetitorId}`}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white">
                      <img
                        src={getLogoUrl(company.domain)}
                        alt={`${company.name} logo`}
                        className="max-h-7 max-w-7 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {company.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">{company.domain}</p>
                    </div>
                    <span className="text-xs font-medium text-blue-600">Open</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Workflow Split</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>Use this page to explore the broader company universe and search what exists.</li>
                <li>Use the tracked competitors page for the narrowed set you actively monitor and compare.</li>
                <li>Promote a company into tracking when it becomes strategically relevant.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
