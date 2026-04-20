import { Queue, QueueEvents, Worker, type Processor, type QueueOptions, type WorkerOptions } from "bullmq";
import IORedis, { type Redis, type RedisOptions } from "ioredis";

export const QUEUE_NAMES = {
	homepageCapture: "assets-homepage-capture",
	emailProcess: "assets-email-process",
	apifyIngest: "assets-apify-ingest",
	computeProxies: "assets-compute-proxies",
	scoreAesthetic: "assets-score-aesthetic",
	metaAdsScrape: "assets-meta-ads-scrape",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

let sharedConnection: Redis | null = null;

export function getRedisConnection(): Redis {
	if (sharedConnection) return sharedConnection;

	const url = process.env.REDIS_URL;
	if (!url) {
		throw new Error("REDIS_URL is not set — BullMQ queues cannot connect.");
	}

	const opts: RedisOptions = {
		maxRetriesPerRequest: null,
		enableReadyCheck: false,
	};

	sharedConnection = new IORedis(url, opts);
	sharedConnection.on("error", (err) => {
		// eslint-disable-next-line no-console
		console.error("[redis]", err.message);
	});
	return sharedConnection;
}

const queueCache = new Map<QueueName, Queue>();

export function getQueue<T = unknown, R = unknown, N extends string = string>(
	name: QueueName,
	options?: Partial<QueueOptions>,
): Queue<T, R, N> {
	const cached = queueCache.get(name);
	if (cached) return cached as unknown as Queue<T, R, N>;

	const queue = new Queue<T, R, N>(name, {
		connection: getRedisConnection(),
		defaultJobOptions: {
			attempts: 3,
			backoff: { type: "exponential", delay: 5000 },
			removeOnComplete: { age: 3600, count: 1000 },
			removeOnFail: { age: 86400, count: 500 },
		},
		...options,
	});
	queueCache.set(name, queue as unknown as Queue);
	return queue;
}

export function makeWorker<T = unknown, R = unknown, N extends string = string>(
	name: QueueName,
	processor: Processor<T, R, N>,
	options?: Partial<WorkerOptions>,
): Worker<T, R, N> {
	return new Worker<T, R, N>(name, processor, {
		connection: getRedisConnection(),
		concurrency: 2,
		...options,
	});
}

export function makeQueueEvents(name: QueueName): QueueEvents {
	return new QueueEvents(name, { connection: getRedisConnection() });
}

export async function closeAllQueues(): Promise<void> {
	await Promise.all(Array.from(queueCache.values()).map((q) => q.close()));
	queueCache.clear();
	if (sharedConnection) {
		await sharedConnection.quit();
		sharedConnection = null;
	}
}
