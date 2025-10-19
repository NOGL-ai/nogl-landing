import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');
    const size = url.searchParams.get('size') || '64';
    const format = url.searchParams.get('format') || 'png';

    const token = process.env.LOGO_DEV_TOKEN || process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
    if (!token) {
      return new Response('Logo.dev token is not configured on the server.', { status: 500 });
    }

    if (!domain) {
      return new Response('Missing domain query param', { status: 400 });
    }

    const logoUrl = `https://img.logo.dev/${encodeURIComponent(domain)}?format=${encodeURIComponent(format)}&size=${encodeURIComponent(size)}&token=${encodeURIComponent(token)}`;

    const res = await fetch(logoUrl);

    if (!res.ok) {
      return new Response('Failed to fetch logo', { status: res.status });
    }

    // Stream the response back to the client without exposing the token
    const headers = new Headers(res.headers);
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    if (!headers.get('Content-Type')) headers.set('Content-Type', 'image/png');

    return new Response(res.body, { status: res.status, headers });
  } catch (err) {
    return new Response('Internal error', { status: 500 });
  }
}
