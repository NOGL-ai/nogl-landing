import { getRedisConnection } from "@/lib/queue";

const keyFor = (brandId: string) => `meta-ads:consecutive-failures:${brandId}`;

export async function incrementFailures(brandId: string): Promise<number> {
	const redis = getRedisConnection();
	const n = await redis.incr(keyFor(brandId));
	await redis.expire(keyFor(brandId), 7 * 86400);
	return n;
}

export async function resetFailures(brandId: string): Promise<void> {
	const redis = getRedisConnection();
	await redis.del(keyFor(brandId));
}

export async function getFailures(brandId: string): Promise<number> {
	const redis = getRedisConnection();
	const v = await redis.get(keyFor(brandId));
	return v ? Number(v) : 0;
}
