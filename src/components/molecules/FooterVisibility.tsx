"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

interface FooterVisibilityProps extends PropsWithChildren {
  lang: string;
}

// Centralized list of app (dashboard) route prefixes
const APP_PREFIXES = new Set([
  "dashboard",
  "settings",
  "catalog",
  "competitors",
  "product-feed",
  "profile",
  "reports",
  "repricing",
  "notifications",
  "user",
  "account",
  "admin",
]);

export default function FooterVisibility({ lang, children }: FooterVisibilityProps) {
  const pathname = usePathname() || "";

  // Path format: /{lang}/... -> split and check the segment after lang
  const segments = pathname.split("/").filter(Boolean);
  const isLangMatched = segments[0] === lang;
  const nextSegment = segments[1] ?? "";
  const isAppRoute = isLangMatched && APP_PREFIXES.has(nextSegment);

  if (isAppRoute) return null;
  return <>{children}</>;
}
