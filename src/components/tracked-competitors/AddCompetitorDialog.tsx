"use client";
import { X, SearchLg as Search, Plus, Globe01 as Globe } from '@untitledui/icons';


import { X, SearchLg as Search, Plus, Globe01 as Globe } from '@untitledui/icons';


import React, { useCallback, useEffect, useRef, useState } from "react";

import { addTrackedCompetitor, listAvailableCompetitors } from "@/actions/trackedCompetitors";

interface CompanyOption {
  id: string;
  name: string;
  slug: string | null;
  domain: string;
  country_code: string | null; // Company.country_code is non-null in schema but nullable in select return
  website: string | null;
  snapshot: { total_products: number } | null;
}

interface AddCompetitorDialogProps {
  tenantCompanyId: string;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function FlagEmoji({ code }: { code?: string | null }) {
  if (!code || code.length !== 2) return <Globe className="h-4 w-4 text-muted-foreground" />;
  const emoji = code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
  return <span className="text-base leading-none">{emoji}</span>;
}

export function AddCompetitorDialog({
  tenantCompanyId,
  open,
  onClose,
  onAdded,
}: AddCompetitorDialogProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CompanyOption[]>([]);
  const [selected, setSelected] = useState<CompanyOption | null>(null);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  // Focus search on mount (parent resets via key prop)
  useEffect(() => {
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  // Fetch results
  useEffect(() => {
    let cancelled = false;
    async function fetchResults() {
      setLoading(true);
      try {
        const data = await listAvailableCompetitors(
          tenantCompanyId,
          debouncedSearch || undefined
        );
        if (!cancelled) setResults((data ?? []) as CompanyOption[]);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchResults();
    return () => { cancelled = true; };
  }, [debouncedSearch, tenantCompanyId]);

  const handleSelect = useCallback((company: CompanyOption) => {
    setSelected(company);
    setNickname(company.name);
    setError(null);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await addTrackedCompetitor({
        tenantCompanyId,
        competitorId: selected.id,
        nickname: nickname.trim() || undefined,
      });
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to add competitor");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-border-secondary bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-secondary px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Add Competitor</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Search for a company to start tracking
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Search */}
            {!selected ? (
              <div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, domain, or slug…"
                    className="w-full rounded-lg border border-border-secondary bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                {/* Results list */}
                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border-secondary bg-background">
                  {loading ? (
                    <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                      Searching…
                    </div>
                  ) : results.length === 0 ? (
                    <div className="flex h-20 flex-col items-center justify-center gap-1 text-sm">
                      <span className="text-muted-foreground">No companies found</span>
                      <span className="text-xs text-muted-foreground/70">
                        {search
                          ? "They may already be tracked, or try a different search."
                          : "Start typing to search…"}
                      </span>
                    </div>
                  ) : (
                    results.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleSelect(company)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
                      >
                        <FlagEmoji code={company.country_code} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">
                            {company.name}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {company.domain}
                          </div>
                        </div>
                        {company.snapshot && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {company.snapshot.total_products.toLocaleString()} products
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Selected — show confirm form */
              <div className="space-y-3">
                {/* Selected company preview */}
                <div className="flex items-center gap-3 rounded-lg border border-border-secondary bg-muted/40 px-4 py-3">
                  <FlagEmoji code={selected.country_code} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{selected.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{selected.domain}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Change
                  </button>
                </div>

                {/* Nickname */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Display name <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={selected.name}
                    className="w-full rounded-lg border border-border-secondary bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {selected && (
            <div className="flex items-center justify-end gap-2 border-t border-border-secondary px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-lg border border-border-secondary bg-background px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {submitting ? "Adding…" : "Track competitor"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}