import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withI18nMiddleware from "@/middlewares/middleware-lang";
import { withSecurityHeaders } from "@/middlewares/middleware-security";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/',
  '/about(.*)',
  '/contact(.*)',
  '/pricing(.*)',
  '/features(.*)',
  '/blog(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/_next(.*)',
  '/images(.*)',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
])

export default clerkMiddleware(async (auth, req) => {
  // Handle i18n middleware first
  const i18nResponse = await withI18nMiddleware(req, {} as any, NextResponse.next());
  
  // Add security headers
  const response = await withSecurityHeaders(req, {} as any, i18nResponse);
  
  // Check if route is public
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
  
  return response;
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
