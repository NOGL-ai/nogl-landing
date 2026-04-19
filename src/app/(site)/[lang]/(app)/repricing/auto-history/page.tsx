import { Metadata } from "next";
import { RepricingHistoryTable } from "@/components/organisms/RepricingHistoryTable";
import { listJobs } from "@/actions/repricing/execution";

export const metadata: Metadata = {
  title: "Repricing History | Nogl",
  description: "Track your repricing activities and results",
  openGraph: {
    title: "Repricing History | Nogl",
    type: "website",
  },
};

export default async function AutoRepricingHistoryPage() {
  const jobs = await listJobs({ limit: 100 }).catch(() => []);

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 rounded-xl border border-border-primary bg-background px-4 py-3">
          <h1 className="text-lg font-semibold text-text-primary">Repricing History</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Track your repricing activities and results. Click a row to inspect
            individual product proposals. Rollback any applied run.
          </p>
        </div>

        <RepricingHistoryTable jobs={jobs} />
      </div>
    </div>
  );
}
