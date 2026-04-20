interface EmptyTenantStateProps {
  reason: "no-company" | "no-tenant";
  companyName?: string;
}

export function EmptyTenantState({ reason, companyName }: EmptyTenantStateProps) {
  const title =
    reason === "no-company"
      ? "Calumet tenant not found"
      : `No forecast data for ${companyName ?? "this tenant"}`;
  const body =
    reason === "no-company"
      ? "The demo Company record is missing. Run npm run seed:forecast-demo to create it."
      : "The tenant exists but has no forecast data yet. Run npm run seed:forecast-demo to seed Instax-based demo data.";

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-border-primary bg-background p-8">
          <h1 className="text-lg font-semibold text-text-primary">Demand forecast</h1>
          <p className="mt-2 text-sm text-text-secondary">{title}</p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-bg-secondary p-4 text-xs text-text-primary">
            {body}
          </pre>
          <p className="mt-4 text-xs text-text-tertiary">
            See <code>scripts/data/README.md</code> for dataset download steps.
          </p>
        </div>
      </div>
    </div>
  );
}
