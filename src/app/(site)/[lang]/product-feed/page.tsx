import { Metadata } from "next";
import DatafeedSettings from "@/components/ProductFeed/DatafeedSettings";
import { getDictionary } from "@/libs/dictionary";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(lang);
  
  return {
    title: dict.productFeed.metaTitle,
    description: dict.productFeed.metaDescription,
    keywords: ["product feed", "feed management", "product distribution", "e-commerce"],
    openGraph: {
      title: dict.productFeed.metaTitle,
      description: dict.productFeed.metaDescription,
      type: "website",
    },
  };
}

export default async function ProductFeedPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-bg-white-0">
      <DatafeedSettings />
    </div>
  );
}
