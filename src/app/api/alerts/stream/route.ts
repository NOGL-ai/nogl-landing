import { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { subscribeAlert, alertChannel } from "@/lib/alertBus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const companyId = searchParams.get("companyId");
  const audience = searchParams.get("audience");

  if (!companyId || !audience) {
    return new Response("companyId and audience are required", { status: 400 });
  }

  const channel = alertChannel(companyId, audience);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // controller already closed
        }
      };

      // Initial heartbeat so the client knows the connection is live
      send(":heartbeat\n\n");

      const unsubscribe = subscribeAlert(channel, (payload) => {
        send(`data: ${payload}\n\n`);
      });

      const heartbeat = setInterval(() => {
        send(":heartbeat\n\n");
      }, 20_000);

      req.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
