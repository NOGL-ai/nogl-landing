import type { Locale } from "@/i18n";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaDb";
import { AccountMappingRow, type AdAccountRow } from "@/components/application/marketing-assets/AccountMappingRow";

export const dynamic = "force-dynamic";

type RawAccount = {
  id: string; platform: string; external_id: string;
  handle: string | null; display_name: string | null;
  status: "ACTIVE" | "UNMAPPED" | "ARCHIVED";
  last_seen_at: Date | null;
  companyName: string | null; competitorName: string | null;
};

async function loadAccounts(statusFilter?: string): Promise<AdAccountRow[]> {
  try {
    const where = statusFilter && statusFilter !== "ALL" ? `WHERE a.status = '${statusFilter}'` : "";
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT a.id, a.platform, a.external_id, a.handle, a.display_name,
              a.status, a.last_seen_at,
              comp.name AS "companyName",
              cmp.name  AS "competitorName"
       FROM ads_events."AdAccount" a
       LEFT JOIN nogl."Company"    comp ON comp.id = a."companyId"
       LEFT JOIN nogl."Competitor" cmp  ON cmp.id  = a."competitorId"
       ${where}
       ORDER BY
         CASE a.status WHEN 'UNMAPPED' THEN 0 WHEN 'ACTIVE' THEN 1 ELSE 2 END,
         a.last_seen_at DESC NULLS LAST
       LIMIT 200`,
    )) as RawAccount[];
    return rows.map((r) => ({
      ...r,
      last_seen_at: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : null,
    }));
  } catch {
    return [];
  }
}

const STATUSES = ["ALL", "UNMAPPED", "ACTIVE", "ARCHIVED"] as const;

export default async function AccountsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    redirect("/en/marketing-assets");
  }

  const [{ lang }, sp] = await Promise.all([params, searchParams]);
  const statusFilter = sp.status ?? "UNMAPPED";
  const accounts = await loadAccounts(statusFilter);
  const unmappedCount = accounts.filter((a) => a.status === "UNMAPPED").length;

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Ad Accounts</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Link scraped accounts to tracked Competitors or Companies.
              {unmappedCount > 0 && (
                <span className="ml-2 rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-700 dark:bg-warning-900 dark:text-warning-300">
                  {unmappedCount} unmapped
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2">
          {STATUSES.map((s) => {
            const active = statusFilter === s;
            return (
              <a
                key={s}
                href={`/${lang}/marketing-assets/accounts?status=${s}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border-secondary bg-bg-primary text-text-secondary hover:border-brand-400"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </a>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border-secondary bg-bg-primary">
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary">
              <tr>
                {["Account", "Platform", "Status", "Mapped To", "Last Seen", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-tertiary">
                    No accounts found
                  </td>
                </tr>
              ) : (
                accounts.map((a) => (
                  <AccountMappingRow key={a.id} account={a} onMapped={() => {}} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
