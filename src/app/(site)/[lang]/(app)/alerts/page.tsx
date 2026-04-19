import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { listAlerts, getAlertCounts } from "@/actions/alerts";
import { AlertInbox } from "@/components/alerts/AlertInbox";
import { CALUMET_COMPANY_ID } from "@/components/alerts/alertConfig";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function CmoAlertsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  await params;
  const session = await getAuthSession();
  if (!session?.user) redirect("/auth/signin");

  const [{ alerts }, counts] = await Promise.all([
    listAlerts({
      companyId: CALUMET_COMPANY_ID,
      audience: "CMO",
      status: ["OPEN", "SNOOZED"],
    }),
    getAlertCounts({ companyId: CALUMET_COMPANY_ID, audience: "CMO" }),
  ]);

  return (
    <AlertInbox
      audience="CMO"
      companyId={CALUMET_COMPANY_ID}
      initialAlerts={alerts}
      initialCounts={counts}
      userId={session.user.id ?? ""}
    />
  );
}
