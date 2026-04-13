import { prisma } from "@/lib/prismaDb";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const competitor = await prisma.competitor.findUnique({
    where: { id },
    select: { id: true, domain: true, status: true },
  });

  if (!competitor) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (competitor.status === "ARCHIVED") {
    return Response.json(
      { error: "Cannot scrape an archived competitor" },
      { status: 422 }
    );
  }

  const scrapydUrl = process.env.SCRAPYD_URL ?? "http://127.0.0.1:6800";
  const scrapydProject = process.env.SCRAPYD_PROJECT ?? "default";
  const scrapydSpider = process.env.SCRAPYD_SPIDER ?? "universal";

  const form = new URLSearchParams({
    project: scrapydProject,
    spider: scrapydSpider,
    domain: competitor.domain,
    competitor_id: competitor.id,
  });

  let jobId: string;
  try {
    const scrapydRes = await fetch(`${scrapydUrl}/schedule.json`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    if (!scrapydRes.ok) {
      const text = await scrapydRes.text();
      console.error("[scrape] Scrapyd error:", text);
      return Response.json(
        { error: "Scrapyd rejected the job" },
        { status: 502 }
      );
    }

    const json = (await scrapydRes.json()) as { jobid?: string; status?: string };
    if (!json.jobid) {
      return Response.json(
        { error: "Scrapyd did not return a job ID" },
        { status: 502 }
      );
    }

    jobId = json.jobid;
  } catch (err) {
    console.error("[scrape] Scrapyd unreachable:", err);
    return Response.json(
      { error: "Could not reach Scrapyd" },
      { status: 503 }
    );
  }

  await prisma.competitor
    .update({
      where: { id },
      data: { lastScrapedAt: new Date() },
    })
    .catch(() => {
      // Non-fatal; the job was already submitted successfully.
    });

  return Response.json({ jobId }, { status: 202 });
}
