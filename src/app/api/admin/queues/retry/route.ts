import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIngestQueue } from "@/lib/queues";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QUEUES: Record<string, () => ReturnType<typeof getIngestQueue>> = {
  "ads-events:ingest": getIngestQueue,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fd = await req.formData();
  const queueName = String(fd.get("queue") ?? "");
  const jobId = String(fd.get("jobId") ?? "");

  const getQueue = QUEUES[queueName];
  if (!getQueue || !jobId) {
    return NextResponse.json({ error: "Invalid queue or job" }, { status: 400 });
  }

  try {
    const q = getQueue();
    const job = await q.getJob(jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    await job.retry();
    return NextResponse.redirect(new URL("/en/admin/queues", req.url));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
