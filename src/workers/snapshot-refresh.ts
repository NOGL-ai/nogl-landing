/**
 * Snapshot refresh worker.
 *
 * `nogl."CompanySnapshot".total_products` gets stale because ingest-side jobs
 * (bridge-scraped-items, ingest-apify, manual seeders) write into
 * `public.products` without touching the snapshot row. The ads-events ingest
 * worker has no per-company context to fix it inline — events carry
 * `AdAccount`, not `Company`.
 *
 * Fix: a lightweight BullMQ repeatable job that runs every 30 minutes and
 * rewrites `total_products` for every snapshot whose live count has drifted.
 * It is a single bulk UPDATE — O(1) round-trips regardless of company count —
 * and only writes rows where the cached value actually differs, so Postgres
 * WAL stays quiet on steady-state runs.
 *
 * The job is scheduled once at worker boot via `upsertJobScheduler` (BullMQ
 * v5). That API is idempotent on the (queue, scheduler-id) pair so calling it
 * on every process restart is safe — no duplicate repeats.
 */
import type { Processor } from "bullmq";
import { prisma } from "@/lib/prismaDb";
import { getQueue, makeWorker, QUEUE_NAMES } from "@/lib/queue";

export const SNAPSHOT_REFRESH_JOB_NAME = "refresh-total-products";
export const SNAPSHOT_REFRESH_SCHEDULER_ID = "snapshot-refresh:every-30m";

const REFRESH_EVERY_MS = 30 * 60 * 1000;

export type SnapshotRefreshJob = Record<string, never>;

export type SnapshotRefreshResult = {
	updated: number;
};

/**
 * Bulk-sync `CompanySnapshot.total_products` to the live row count in
 * `public.products`. Returns the number of snapshot rows actually written
 * (rows whose cached value matched the live count are left untouched by the
 * `IS DISTINCT FROM` guard).
 */
export async function refreshCompanySnapshotTotals(): Promise<SnapshotRefreshResult> {
	const updated = await prisma.$executeRaw`
		UPDATE nogl."CompanySnapshot" cs
		SET total_products = sub.cnt
		FROM (
			SELECT company_id, COUNT(*)::int AS cnt
			FROM public.products
			WHERE company_id IS NOT NULL
			GROUP BY company_id
		) sub
		WHERE cs.company_id = sub.company_id
			AND cs.total_products IS DISTINCT FROM sub.cnt
	`;

	return { updated };
}

const processor: Processor<SnapshotRefreshJob, SnapshotRefreshResult> = async () => {
	return refreshCompanySnapshotTotals();
};

/**
 * Registers the repeatable job. Safe to call on every boot — BullMQ's job
 * scheduler is idempotent on `SNAPSHOT_REFRESH_SCHEDULER_ID`.
 */
export async function scheduleSnapshotRefresh(): Promise<void> {
	const queue = getQueue(QUEUE_NAMES.snapshotRefresh);

	// BullMQ v5: `upsertJobScheduler` replaces the deprecated `repeat` option.
	// Fall back to the legacy API if the new method is missing (older BullMQ).
	const q = queue as unknown as {
		upsertJobScheduler?: (
			id: string,
			opts: { every: number; immediately?: boolean },
			data?: { name: string; data: SnapshotRefreshJob },
		) => Promise<unknown>;
		add: (
			name: string,
			data: SnapshotRefreshJob,
			opts?: { repeat?: { every: number }; jobId?: string },
		) => Promise<unknown>;
	};

	if (typeof q.upsertJobScheduler === "function") {
		await q.upsertJobScheduler(
			SNAPSHOT_REFRESH_SCHEDULER_ID,
			{ every: REFRESH_EVERY_MS, immediately: true },
			{ name: SNAPSHOT_REFRESH_JOB_NAME, data: {} },
		);
		return;
	}

	await q.add(SNAPSHOT_REFRESH_JOB_NAME, {}, { repeat: { every: REFRESH_EVERY_MS } });
}

export function startSnapshotRefreshWorker() {
	// Schedule the repeatable job once at boot. Errors are logged but do not
	// prevent the worker from coming up — a missing schedule is recoverable on
	// the next deploy, a crashed worker is not.
	void scheduleSnapshotRefresh().catch((err: unknown) => {
		console.error(
			"[snapshot-refresh] failed to schedule repeatable job:",
			err instanceof Error ? err.message : err,
		);
	});

	return makeWorker<SnapshotRefreshJob, SnapshotRefreshResult>(
		QUEUE_NAMES.snapshotRefresh,
		processor,
		{ concurrency: 1 },
	);
}
