import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT ?? "http://10.10.10.180:7070",
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
}

const BUCKET = process.env.S3_BUCKET_AD_CREATIVES ?? "ad-creative-assets";
const ENDPOINT = process.env.S3_ENDPOINT ?? "http://10.10.10.180:7070";

export async function uploadCreativeToS3(
  mediaUrl: string,
  platform: string,
  creativeHash: string,
): Promise<string | null> {
  if (!process.env.S3_ACCESS_KEY_ID) return null;
  if (!mediaUrl.startsWith("http")) return null;
  try {
    const resp = await fetch(mediaUrl, { signal: AbortSignal.timeout(30_000) });
    if (!resp.ok) return null;
    const contentType = resp.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.includes("mp4")
      ? "mp4"
      : contentType.includes("png")
        ? "png"
        : contentType.includes("webp")
          ? "webp"
          : "jpg";
    const key = `${platform.toLowerCase()}/${creativeHash}.${ext}`;
    const body = Buffer.from(await resp.arrayBuffer());
    await getS3Client().send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }),
    );
    return `${ENDPOINT}/${BUCKET}/${key}`;
  } catch {
    return null;
  }
}
