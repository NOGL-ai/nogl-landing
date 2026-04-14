import { EventsTab } from "@/components/companies/tabs/EventsTab";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventsTab slug={slug} />;
}
