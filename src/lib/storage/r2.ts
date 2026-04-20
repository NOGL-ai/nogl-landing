import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

function getClient(): S3Client {
	if (client) return client;
	const accountId = process.env.R2_ACCOUNT_ID;
	const accessKeyId = process.env.R2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
	if (!accountId || !accessKeyId || !secretAccessKey) {
		throw new Error("R2 credentials missing (R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY)");
	}
	client = new S3Client({
		region: "auto",
		endpoint: `https://${accountId}.eu.r2.cloudflarestorage.com`,
		forcePathStyle: true,
		credentials: { accessKeyId, secretAccessKey },
	});
	return client;
}

export function getBucket(): string {
	const bucket = process.env.R2_BUCKET_NAME;
	if (!bucket) throw new Error("R2_BUCKET_NAME missing");
	return bucket;
}

export type PutObjectParams = {
	key: string;
	body: Buffer | Uint8Array | string;
	contentType: string;
	metadata?: Record<string, string>;
};

export async function putObject(params: PutObjectParams): Promise<{ key: string; url: string }> {
	const Bucket = getBucket();
	const input: PutObjectCommandInput = {
		Bucket,
		Key: params.key,
		Body: params.body,
		ContentType: params.contentType,
		Metadata: params.metadata,
	};
	await getClient().send(new PutObjectCommand(input));
	return { key: params.key, url: publicUrl(params.key) };
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
	const res = await getClient().send(
		new GetObjectCommand({ Bucket: getBucket(), Key: key }),
	);
	if (!res.Body) throw new Error(`R2 object ${key} has no body`);
	const chunks: Buffer[] = [];
	// @ts-expect-error AWS SDK v3 returns a web ReadableStream or Node Readable; both iterate.
	for await (const chunk of res.Body) chunks.push(Buffer.from(chunk));
	return Buffer.concat(chunks);
}

export async function deleteObject(key: string): Promise<void> {
	await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

export async function signedGetUrl(key: string, expiresIn = 3600): Promise<string> {
	return getSignedUrl(
		getClient(),
		new GetObjectCommand({ Bucket: getBucket(), Key: key }),
		{ expiresIn },
	);
}

export function publicUrl(key: string): string {
	const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
	if (base) return `${base}/${key}`;
	return `/api/marketing-assets/media/${encodeURIComponent(key)}`;
}
