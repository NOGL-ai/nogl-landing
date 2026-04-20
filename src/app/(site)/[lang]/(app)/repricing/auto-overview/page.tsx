import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RepricingPreviewTable } from "@/components/organisms/RepricingPreviewTable";
import { getJob } from "@/actions/repricing/execution";
import type { Route } from 'next';

export const metadata: Metadata = {
  title: "Repricing Preview | Nogl",
  description: "Preview how your catalog prices would be updated according to your repricing rule",
  openGraph: {
    title: "Repricing Preview | Nogl",
    type: "website",
  },
};

interface PageProps {
  searchParams: { jobId?: string };
}

export default async function AutoRepricingOverviewPage({ searchParams }: PageProps) {
  const { jobId } = searchParams;

  if (!jobId) {
    return (
      <div className="min-h-screen bg-bg-secondary p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-border-primary bg-background p-8 text-center">
            <p className="text-text-secondary">
              No preview selected.{" "}
              <Link href={"/repricing/auto-rules" as Route} className="text-brand-solid underline">
                Go to rules →
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const job = await getJob(jobId).catch(() => null);

  if (!job) notFound();

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-border-primary bg-background px-4 py-3">
          <Link
            href={"/repricing/auto-rules" as Route}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Rules
          </Link>
          <span className="text-text-tertiary">/</span>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-text-primary">
              Repricing Preview
              {job.ruleName ? ` — ${job.ruleName}` : ""}
            </h1>
            <p className="text-sm text-text-secondary">
              Review the proposed price changes. Apply or reject individually or in bulk.
            </p>
          </div>
        </div>

        <RepricingPreviewTable job={job} proposals={job.proposals} />
      </div>
    </div>
  );
}