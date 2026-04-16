export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Analytics Tools</h1>
        <p className="text-muted-foreground">Access analytics tools and utilities.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="h-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
