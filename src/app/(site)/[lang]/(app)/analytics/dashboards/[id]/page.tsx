import { notFound } from "next/navigation";
import { getDashboard } from "@/actions/dashboards";
import { DashboardEditor } from "@/components/dashboards/DashboardEditor";
import type { Locale } from "@/i18n";

export default async function DashboardDetailPage({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const { lang, id } = await params;

  let dashboard: Awaited<ReturnType<typeof getDashboard>>;
  try {
    dashboard = await getDashboard(id);
  } catch {
    notFound();
  }

  return <DashboardEditor dashboard={dashboard} lang={lang} />;
}
