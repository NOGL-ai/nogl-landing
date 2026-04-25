/**
 * Tenant resolution for ad-scoring pages.
 *
 * The User model has no direct tenant relation, so for the pilot we infer
 * the tenant slug from the user's email.  Mapping table is intentionally
 * narrow — explicit map for known pilot tenants, with an email-domain
 * fallback for everything else.
 *
 * Real row-level filtering will land in CT 421; this is "security-by-
 * obscurity" client-side filtering scoped to the demo.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Email -> tenant-slug overrides for pilot users. */
const EMAIL_TO_TENANT: Record<string, string> = {
  "calumet@nogl.tech": "calumet_de",
  "teltec@nogl.tech": "teltec_de",
};

/** Token used inside a brand name to identify a tenant. */
const TENANT_BRAND_TOKEN: Record<string, string> = {
  calumet_de: "calumet",
  teltec_de: "teltec",
};

export interface TenantContext {
  /** Tenant slug, e.g. "calumet_de", or null if user is admin/unscoped. */
  tenantSlug: string | null;
  /** True if the current user has the ADMIN role and should bypass scoping. */
  isAdmin: boolean;
  /** Token for substring matching against brand.name (lowercased). */
  brandToken: string | null;
}

/**
 * Resolve the current user's tenant context from the NextAuth session.
 * Admins always see everything (returns { isAdmin: true, tenantSlug: null }).
 */
export async function getTenantContext(): Promise<TenantContext> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase() ?? null;
  const role = (session?.user as { role?: string } | null)?.role ?? null;
  const isAdmin = role === "ADMIN";

  if (isAdmin) return { tenantSlug: null, isAdmin: true, brandToken: null };
  if (!email) return { tenantSlug: null, isAdmin: false, brandToken: null };

  // Explicit map first
  let slug = EMAIL_TO_TENANT[email] ?? null;

  // Fallback: derive slug from local part (e.g. "calumet@nogl.tech" -> "calumet_de")
  if (!slug) {
    const local = email.split("@")[0];
    if (local && /^[a-z][a-z0-9_-]*$/.test(local)) {
      // Default region suffix when not specified.
      slug = local.includes("_") ? local : `${local}_de`;
    }
  }

  const brandToken = slug ? (TENANT_BRAND_TOKEN[slug] ?? slug.split("_")[0] ?? null) : null;
  return { tenantSlug: slug, isAdmin: false, brandToken };
}

/**
 * Filter a list of brand profiles to those belonging to the current tenant.
 * Admins see everything. Users without a resolvable tenant see nothing.
 */
export function filterBrandsByTenant<T extends { name: string }>(
  brands: T[],
  ctx: TenantContext,
): T[] {
  if (ctx.isAdmin) return brands;
  if (!ctx.brandToken) return [];
  const token = ctx.brandToken.toLowerCase();
  return brands.filter((b) => b.name.toLowerCase().includes(token));
}
