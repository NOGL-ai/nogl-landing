'use client';

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import type { Route } from 'next';

// Move constants outside component to prevent recreating on each render
const PUBLIC_PATHS = new Set([
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/invite",
  "/auth/reset-password",
  "/verify-email",
  "/privacy-policy",
  "/roi",
  "/tos"
] as const);

export default function AuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isRedirectingRef = useRef(false);

  // Memoize path checking logic
  const isPublicPath = useCallback((path: string) => {
    return PUBLIC_PATHS.has(path as any) || 
           Array.from(PUBLIC_PATHS).some(publicPath => path.startsWith(`${publicPath}/`));
  }, []);

  useEffect(() => {
    // Prevent multiple redirects
    if (isRedirectingRef.current) return;

    // Early return for public paths
    if (isPublicPath(pathname || '')) return;

    const handleRedirect = (path: string) => {
      isRedirectingRef.current = true;
      router.push(path as Route);
    };

    // Authentication checks in order of priority
    if (status === "unauthenticated") {
      // Only redirect to signin without any callback URL
      handleRedirect('/auth/signin');
      return;
    }

    if (!session?.user) return;

    if (!session.user.email) {
      handleRedirect('/auth/signin');
      return;
    }

    // Only check onboarding if we're authenticated
    if (status === "authenticated" && 
        !session.user.onboardingCompleted && 
        !pathname?.startsWith("/onboarding")) {
      handleRedirect('/onboarding');
      return;
    }
  }, [pathname, status, session, router, isPublicPath]);

  return children;
} 