import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prismaDb';
import { withRequestLogging } from '@/middlewares/security';
import { withRateLimit } from '@/middlewares/rateLimit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const Body = z.object({
  docPath: z
    .string()
    .regex(/^fractional-cfo[/]docs[/][\w\-/]+$/)
    .max(200),
  locale: z.enum(['en', 'de']),
  rating: z.enum(['UP', 'DOWN']),
  comment: z.string().trim().max(1000).optional(),
});

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions).catch(() => null);
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ipHash = createHash('sha256')
    .update(ip + (process.env.IP_HASH_SALT ?? 'dev'))
    .digest('hex');

  await prisma.docFeedback.create({
    data: {
      docPath: parsed.data.docPath,
      locale: parsed.data.locale,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      userId: session?.user?.id ?? null,
      ipHash,
      userAgent: req.headers.get('user-agent')?.slice(0, 512) ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}

export const POST = withRequestLogging(withRateLimit(20, 60_000)(handler));
