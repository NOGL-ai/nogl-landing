import { getCalumetTenantId } from "@/lib/tenant";
import { getAssetStats } from "@/actions/marketing-assets";
import MarketingAssetLibrary from "@/components/marketing-assets/MarketingAssetLibrary";
import type { AssetStatsByType } from "@/types/marketing-asset";

export const dynamic = "force-dynamic";

async function loadStatsSafe(): Promise<AssetStatsByType | null> {
	try {
		await getCalumetTenantId();
		return await getAssetStats();
	} catch {
		return null;
	}
}

export default async function MarketingAssetsPage() {
	const stats = await loadStatsSafe();
	return (
		<div className='min-h-screen bg-bg-secondary p-6'>
			<div className='mx-auto max-w-7xl space-y-6'>
				<div className='flex flex-col gap-2'>
					<h1 className='text-3xl font-bold text-foreground'>Marketing Asset Library</h1>
					<p className='text-sm text-muted-foreground'>
						Everything your tracked competitors are publishing — emails, homepages, and paid ads —
						in one place.
					</p>
				</div>
				<MarketingAssetLibrary initialStats={stats} />
			</div>
		</div>
	);
}
