// Docs search endpoint — wraps the fumadocs-core Flexsearch index.
// The handler's Response type is not directly compatible with our NextResponse-typed
// middleware wrappers, so we export GET directly and let Next.js handle it.
export { GET } from '@/lib/docs/search';
