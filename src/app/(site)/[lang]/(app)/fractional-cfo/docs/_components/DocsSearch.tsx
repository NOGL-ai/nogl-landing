'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils';
import { useDocsSearch } from 'fumadocs-core/search/client';

interface DocsSearchProps {
  lang: string;
}

export function DocsSearch({ lang }: DocsSearchProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, setSearch, query } = useDocsSearch(lang, undefined, '/api/docs/search');

  const results = !query.data || query.data === 'empty' ? [] : (query.data as Array<{ url: string; content: string }>);

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIdx(0);
    } else {
      setSearch('');
    }
  }, [open, setSearch]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      setOpen(false);
      window.location.href = results[activeIdx].url;
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Search documentation (⌘K)"
      >
        <svg className="h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <span className="flex-1 text-left">Search docs…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-mono">
          <span>⌘K</span>
        </kbd>
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modal dialog */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
          className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-background shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <svg className="h-4 w-4 shrink-0 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search documentation…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveIdx(0); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => setOpen(false)}
              className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted"
            >
              Esc
            </button>
          </div>

          <ul className="max-h-72 overflow-y-auto py-2" role="listbox">
            {query.isLoading && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">Searching…</li>
            )}
            {!query.isLoading && results.length === 0 && search.length > 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No results for &ldquo;{search}&rdquo;</li>
            )}
            {results.map((result, idx) => (
              <li key={result.url} role="option" aria-selected={idx === activeIdx}>
                <Link
                  href={result.url as Route}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                    idx === activeIdx ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                  onMouseEnter={() => setActiveIdx(idx)}
                >
                  <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {result.content}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
