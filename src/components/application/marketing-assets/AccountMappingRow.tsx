"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/base/buttons/button';
import { Input } from "@/components/ui/input";
import { mapAdAccount } from "@/actions/ads-events/accounts";

export interface AdAccountRow {
  id: string;
  platform: string;
  external_id: string;
  handle: string | null;
  display_name: string | null;
  status: "ACTIVE" | "UNMAPPED" | "ARCHIVED";
  last_seen_at: string | null;
  companyName: string | null;
  competitorName: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
  UNMAPPED: "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
  ARCHIVED: "bg-bg-secondary text-text-tertiary",
};

export function AccountMappingRow({ account, onMapped }: { account: AdAccountRow; onMapped: () => void }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleMap(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const name = fd.get("name") as string;
    startTransition(async () => {
      await mapAdAccount(account.id, name.trim());
      setEditing(false);
      onMapped();
    });
  }

  return (
    <tr className="border-b border-border-secondary hover:bg-bg-secondary/50">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          {account.handle && (
            <span className="text-sm font-medium text-text-primary">@{account.handle}</span>
          )}
          {account.display_name && (
            <span className="text-xs text-text-tertiary">{account.display_name}</span>
          )}
          <span className="font-mono text-[10px] text-text-quaternary">{account.external_id}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-medium text-text-secondary">{account.platform}</span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[account.status]}`}
        >
          {account.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {account.companyName ?? account.competitorName ?? (
          <span className="italic text-text-tertiary">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {account.last_seen_at
          ? new Date(account.last_seen_at).toLocaleDateString("en-GB")
          : "—"}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <form onSubmit={handleMap} className="flex gap-2">
            <Input
              name="name"
              placeholder="Competitor / Company name"
              className="h-7 w-48 text-xs"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-7 text-xs" disabled={isPending}>
              {isPending ? "Saving…" : "Link"}
            </Button>
            <Button
              type="button"
              color="tertiary"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <Button
            color="secondary"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setEditing(true)}
          >
            {account.status === "UNMAPPED" ? "Map →" : "Re-map"}
          </Button>
        )}
      </td>
    </tr>
  );
}
