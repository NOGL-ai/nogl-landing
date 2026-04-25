import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { listAlerts, getAlertCounts } from "@/actions/alerts";
import { AlertInbox } from "@/components/alerts/AlertInbox";
import { CALUMET_COMPANY_ID } from "@/components/alerts/alertConfig";
import type { Locale } from "@/i18n";
import type { Route } from 'next';

export const dynamic = "force-dynamic";

export default async function CfoAlertsInboxPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  await params;
  const session = await getAuthSession();
  if (!session?.user) redirect("/auth/signin" as Route);

  const [{ alerts }, counts] = await Promise.all([
    listAlerts({
      companyId: CALUMET_COMPANY_ID,
      audience: "CFO",
      status: ["OPEN", "SNOOZED"],
    }),
    getAlertCounts({ companyId: CALUMET_COMPANY_ID, audience: "CFO" }),
  ]);

  return (
    <AlertInbox
      audience="CFO"
      companyId={CALUMET_COMPANY_ID}
      initialAlerts={alerts}
      initialCounts={counts}
      userId={session.user.id ?? ""}
    />
  );
}
