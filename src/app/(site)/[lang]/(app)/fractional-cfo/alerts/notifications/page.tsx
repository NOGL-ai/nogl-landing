import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getSubscriptions } from "@/actions/alerts";
import { CALUMET_COMPANY_ID, CFO_TYPE_GROUPS } from "@/components/alerts/alertConfig";
import { AlertNotificationsClient } from "@/components/alerts/AlertNotificationsClient";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function AlertNotificationsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  await params;
  const session = await getAuthSession();
  if (!session?.user) redirect("/auth/signin");

  const subscriptions = await getSubscriptions({
    userId: session.user.id ?? "",
    companyId: CALUMET_COMPANY_ID,
    audience: "CFO",
  });

  return (
    <AlertNotificationsClient
      userId={session.user.id ?? ""}
      companyId={CALUMET_COMPANY_ID}
      initialSubscriptions={subscriptions}
      groups={CFO_TYPE_GROUPS}
    />
  );
}
