import type { Locale } from "@/i18n";
import { ExportsWorkspace } from "@/components/exports/ExportsWorkspace";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Exports | NOGL",
	description: "Generate and manage competitor export reports",
};

export default async function ExportsPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	return <ExportsWorkspace lang={lang} />;
}
