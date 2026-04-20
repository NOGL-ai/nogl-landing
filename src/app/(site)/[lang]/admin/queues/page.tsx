import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Locale } from "@/i18n";
import { QueueDepthCard } from "@/components/application/marketing-assets/QueueDepthCard";
import { getIngestQueue } from "@/lib/queues";
import { prisma } from "@/lib/prismaDb";

export const dynamic = "force-dynamic";

const QUEUE_GETTERS = [getIngestQueue];

async function getQueueStats() {
  return Promise.all(
    QUEUE_GETTERS.map(async (getQ) => {
      try {
        const q = getQ();
        const [counts, failed] = await Promise.all([
          q.getJobCounts("waiting", "active", "completed", "failed", "delayed", "paused"),
          q.getFailed(0, 9),
        ]);
        return {
          name: q.name,
          counts,
          recentFailed: failed.map((j) => ({
            id: j.id ?? "",
            name: j.name,
            failedReason: j.failedReason ?? "",
            finishedOn: j.finishedOn ? new Date(j.finishedOn).toISOString() : null,
            attemptsMade: j.attemptsMade,
          })),
          healthy: true,
        };
      } catch (err) {
        return {
          name: getQ.toString().match(/QUEUE_NAME\s*=\s*["']([^"']+)/)?.[1] ?? "unknown",
          counts: {},
          recentFailed: [],
          healthy: false,
          error: String(err),
        };
      }
    }),
  );
}

type RunRow = {
  id: string; source: string; status: string;
  started_at: string; finished_at: string | null;
  events_in: number; events_accepted: number; events_rejected: number;
};

async function getLastRuns(): Promise<RunRow[]> {
  try {
    return (await prisma.$queryRawUnsafe(
      `SELECT id, source, status, started_at, finished_at,
              events_in, events_accepted, events_rejected
       FROM ads_events."ScraperRun"
       ORDER BY started_at DESC LIMIT 10`,
    )) as RunRow[];
  } catch {
    return [];
  }
}

export default async function AdminQueuesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    redirect("/en/dashboard");
  }
  await params;

  const [queues, runs] = await Promise.all([getQueueStats(), getLastRuns()]);

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Queue Monitor</h1>
          <p className="mt-1 text-sm text-text-secondary">
            BullMQ queue depths and recent scraper runs. Retry failed jobs from here.
          </p>
        </div>

        {/* Queue stat cards */}
        {queues.map((q) => (
          <section key={q.name} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-sm font-semibold text-text-primary">{q.name}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  q.healthy
                    ? "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300"
                    : "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300"
                }`}
              >
                {q.healthy ? "connected" : "unreachable"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {(
                [
                  ["waiting", "Waiting"],
                  ["active", "Active"],
                  ["completed", "Completed"],
                  ["failed", "Failed"],
                  ["delayed", "Delayed"],
                  ["paused", "Paused"],
                ] as const
              ).map(([key, label]) => (
                <QueueDepthCard
                  key={key}
                  label={label}
                  value={(q.counts as Record<string, number>)[key] ?? 0}
                  variant={
                    key === "failed" && (q.counts as Record<string, number>)[key] > 0
                      ? "error"
                      : key === "active" && (q.counts as Record<string, number>)[key] > 0
                        ? "success"
                        : "default"
                  }
                />
              ))}
            </div>

            {q.recentFailed.length > 0 && (
              <div className="rounded-xl border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-950">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-error-700 dark:text-error-300">
                  Recent Failed Jobs
                </h3>
                <div className="space-y-2">
                  {q.recentFailed.map((j) => (
                    <div
                      key={j.id}
                      className="flex items-start justify-between gap-4 rounded-lg bg-bg-primary p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-medium text-text-primary">{j.name}</p>
                        <p className="mt-0.5 truncate text-xs text-error-600 dark:text-error-400">
                          {j.failedReason}
                        </p>
                        <p className="mt-0.5 text-[10px] text-text-quaternary">
                          {j.attemptsMade} attempt{j.attemptsMade !== 1 ? "s" : ""} •{" "}
                          {j.finishedOn ? new Date(j.finishedOn).toLocaleString("en-GB") : "—"}
                        </p>
                      </div>
                      <RetryJobForm queueName={q.name} jobId={j.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Scraper run history */}
        {runs.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-text-primary">Scraper Run History</h2>
            <div className="overflow-hidden rounded-xl border border-border-secondary bg-bg-primary">
              <table className="w-full text-sm">
                <thead className="bg-bg-secondary">
                  <tr>
                    {["Source", "Status", "Events In", "Accepted", "Rejected", "Started"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-t border-border-secondary">
                      <td className="px-4 py-2.5 font-mono text-xs">{r.source}</td>
                      <td className="px-4 py-2.5">
                        <RunStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-xs">{r.events_in}</td>
                      <td className="px-4 py-2.5 tabular-nums text-xs text-success-600">
                        {r.events_accepted}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-xs text-error-600">
                        {r.events_rejected}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-text-tertiary">
                        {new Date(r.started_at).toLocaleString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RunStatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    OK: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
    RUNNING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    PARTIAL: "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
    FAILED: "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls[status] ?? ""}`}>
      {status}
    </span>
  );
}

function RetryJobForm({ queueName, jobId }: { queueName: string; jobId: string }) {
  return (
    <form
      action={`/api/admin/queues/retry`}
      method="POST"
    >
      <input type="hidden" name="queue" value={queueName} />
      <input type="hidden" name="jobId" value={jobId} />
      <button
        type="submit"
        className="shrink-0 rounded-lg border border-border-secondary bg-bg-primary px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-brand-400 hover:text-brand-600"
      >
        Retry
      </button>
    </form>
  );
}
