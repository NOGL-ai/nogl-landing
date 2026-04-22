"use client";

import { useMemo, useState } from "react";
import { SearchLg } from "@untitledui/icons";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CompanyOption = {
  slug: string;
  name: string;
};

type CompanyPickerModalProps = {
  open: boolean;
  title: string;
  description: string;
  companies: CompanyOption[];
  selectedSlug: string | null;
  blockedSlug?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (slug: string) => void;
};

export function CompanyPickerModal({
  open,
  title,
  description,
  companies,
  selectedSlug,
  blockedSlug = null,
  onOpenChange,
  onConfirm,
}: CompanyPickerModalProps) {
  const [query, setQuery] = useState("");
  const [draftSlug, setDraftSlug] = useState<string | null>(selectedSlug);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (company.slug === blockedSlug) return false;
      if (!q) return true;
      return company.name.toLowerCase().includes(q) || company.slug.toLowerCase().includes(q);
    });
  }, [blockedSlug, companies, query]);

  const canConfirm = Boolean(draftSlug);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0" showCloseButton>
        <DialogHeader className="border-b border-border px-5 pt-5 pb-4 text-left">
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <label className="relative block">
            <SearchLg className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="sr-only">Search company</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company..."
              className="h-10 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={(event) => {
                if (event.key === "Enter" && draftSlug) {
                  onConfirm(draftSlug);
                  onOpenChange(false);
                }
              }}
            />
          </label>

          <div className="max-h-80 overflow-y-auto rounded-md border border-border">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No companies match your search.</p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((company) => {
                  const active = company.slug === draftSlug;
                  return (
                    <li key={company.slug}>
                      <button
                        type="button"
                        onClick={() => setDraftSlug(company.slug)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                          active
                            ? "bg-primary/10 text-foreground ring-1 ring-inset ring-primary/20"
                            : "text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="truncate">{company.name}</span>
                        {active ? (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                            Selected
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border px-5 pt-4 pb-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!draftSlug) return;
              onConfirm(draftSlug);
              onOpenChange(false);
            }}
            disabled={!canConfirm}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm company
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
