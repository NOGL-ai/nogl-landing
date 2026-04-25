import { ArrowRight, UploadCloud01 as UploadCloud, Palette, Eye } from "@untitledui/icons";
import Link from "next/link";
import type { Locale } from "@/i18n";

export const metadata = {
  title: "Creative Scoring",
  description: "Upload, score, and review ad creatives.",
};

export default async function AdScoringHomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  const sections = [
    {
      href: `/${lang}/ad-scoring/assets`,
      label: "Upload & Score",
      desc: "Submit images or videos to the 27-criterion pipeline.",
      Icon: UploadCloud,
    },
    {
      href: `/${lang}/ad-scoring/brands`,
      label: "Brands",
      desc: "Brand profiles powering colour, CTA, and keyword metrics.",
      Icon: Palette,
    },
    {
      href: `/${lang}/ad-scoring/reviews`,
      label: "Reviews",
      desc: "Human-in-the-loop queue for low-confidence and Tier-C metrics.",
      Icon: Eye,
    },
  ] as const;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Creative Scoring</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Choose a section below — or jump in via the sidebar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href as never}
            className="group rounded-xl border border-border-primary bg-bg-primary p-5 shadow-sm hover:border-border-brand hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className="h-6 w-6 text-text-brand" />
              <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-text-brand transition-colors" />
            </div>
            <h2 className="text-base font-medium text-text-primary">{label}</h2>
            <p className="mt-1 text-xs text-text-tertiary">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
