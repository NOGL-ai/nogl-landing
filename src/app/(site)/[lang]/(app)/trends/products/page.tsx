import Link from "next/link";
import { TrendUp01 as TrendingUp } from "@untitledui/icons";
import type { Locale } from "@/i18n";

export const metadata = {
  title: "Product Trends",
};

export default async function ProductTrendsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  return (
    <div className="p-6 max-w-3xl mx-auto text-center space-y-4">
      <TrendingUp className="h-12 w-12 text-text-tertiary mx-auto" />
      <h1 className="text-2xl font-semibold text-text-primary">Product Trends</h1>
      <p className="text-sm text-text-secondary">
        Coming Q2 — currently in beta on a feature branch and not yet enabled here.
      </p>
      <Link
        href={`/${lang}/trends` as never}
        className="inline-block text-sm font-medium text-text-brand hover:underline"
      >
        ← Back to Trends
      </Link>
    </div>
  );
}
