import type { Locale } from "@/i18n";
import { AdEventsTable } from "@/components/application/marketing-assets/AdEventsTable";

export const dynamic = "force-dynamic";

export default async function RawEventsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  await params;

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Raw Events</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Every ingested ad event — click a row to inspect the full payload.
          </p>
        </div>
        <AdEventsTable />
      </div>
    </div>
  );
}
