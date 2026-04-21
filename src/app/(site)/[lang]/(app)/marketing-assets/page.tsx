import type { Locale } from "@/i18n";
import { getAssetStats } from "@/actions/marketing-assets";
import { MarketingAssetLibrary } from "@/components/marketing-assets/MarketingAssetLibrary";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Marketing Asset Library | NOGL",
	description: "Browse marketing creatives across channels",
};

export default async function MarketingAssetsPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;

	let initialStats = null;
	try {
		initialStats = await getAssetStats();
	} catch {
		initialStats = null;
	}

	return <MarketingAssetLibrary initialStats={initialStats} lang={lang} />;
}
