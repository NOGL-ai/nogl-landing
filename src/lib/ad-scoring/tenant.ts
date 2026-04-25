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
  "erhardt@nogl.tech": "foto_erhardt_de",
  "leistenschneider@nogl.tech": "foto_leistenschneider_de",
  "fotokoch@nogl.tech": "fotokoch_de",
};

/**
 * Stable list of tenant IDs that exist in assets.Tenant on CT 213.
 * Verified 2026-04-25 via:
 *   psql -d nogl_landing -c 'SELECT id FROM assets."Tenant";'
 * Used as a sanity check on the local-part fallback so we don't leak
 * other tenants when a user's local part happens to match an unrelated
 * slug.
 */
const KNOWN_TENANT_IDS: ReadonlySet<string> = new Set([
  "calumet",
  "calumet_de",
  "foto_erhardt",
  "foto_erhardt_de",
  "fotokoch_de",
  "foto_leistenschneider_de",
  "kamera_express",
  "kamera_express_de",
  "teltec_de",
]);

/** Token used inside a brand name to identify a tenant. */
const TENANT_BRAND_TOKEN: Record<string, string> = {
  calumet_de: "calumet",
  teltec_de: "teltec",
  foto_erhardt_de: "erhardt",
  foto_leistenschneider_de: "leistenschneider",
  fotokoch_de: "fotokoch",
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

  // Fallback: derive slug from local part (e.g. "calumet@nogl.tech" -> "calumet_de").
  // Validate against KNOWN_TENANT_IDS to avoid silently leaking another tenant's
  // data when the local part matches an unrelated slug.
  if (!slug) {
    const local = email.split("@")[0];
    if (local && /^[a-z][a-z0-9_-]*$/.test(local)) {
      const candidate = local.includes("_") ? local : `${local}_de`;
      if (KNOWN_TENANT_IDS.has(candidate)) {
        slug = candidate;
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `[tenant] No tenant mapping for email "${email}"; derived slug ` +
            `"${candidate}" not in KNOWN_TENANT_IDS. Returning null so ` +
            `caller renders an empty state instead of leaking other tenants.`,
        );
      }
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
