import { DotsHorizontal as MoreHorizontal, PauseCircle as Pause, Play, Pencil01 as Pencil, Trash01 as Trash2 } from '@untitledui/icons';
"use client";

import React, { useState } from "react";

import {
  pauseTrackedCompetitor,
  resumeTrackedCompetitor,
  removeTrackedCompetitor,
  renameTrackedCompetitor,
} from "@/actions/trackedCompetitors";

interface RowActionsMenuProps {
  trackedId: string;
  competitorName: string;
  currentStatus: "ACTIVE" | "PAUSED" | "ARCHIVED";
  currentNickname?: string | null;
  onMutated: () => void;
}

export function RowActionsMenu({
  trackedId,
  competitorName,
  currentStatus,
  currentNickname,
  onMutated,
}: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nickname, setNickname] = useState(currentNickname ?? "");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function withAction(fn: () => Promise<void>) {
    setLoading(true);
    setActionError(null);
    try {
      await fn();
    } catch (err: any) {
      setActionError(err?.message ?? "Action failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePause() {
    setOpen(false);
    await withAction(async () => {
      await pauseTrackedCompetitor(trackedId);
      onMutated();
    });
  }

  async function handleResume() {
    setOpen(false);
    await withAction(async () => {
      await resumeTrackedCompetitor(trackedId);
      onMutated();
    });
  }

  async function handleRemove() {
    if (!confirm(`Stop tracking ${competitorName}?`)) return;
    setOpen(false);
    await withAction(async () => {
      await removeTrackedCompetitor(trackedId);
      onMutated();
    });
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    await withAction(async () => {
      await renameTrackedCompetitor(trackedId, nickname);
      setRenaming(false);
      onMutated();
    });
  }

  if (actionError) {
    return (
      <span className="text-xs text-red-600" title={actionError}>
        ⚠ {actionError.slice(0, 40)}
        <button
          type="button"
          onClick={() => setActionError(null)}
          className="ml-1 underline"
        >
          dismiss
        </button>
      </span>
    );
  }

  if (renaming) {
    return (
      <form onSubmit={handleRename} className="flex items-center gap-1">
        <input
          autoFocus
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={competitorName}
          className="w-32 rounded border border-border-secondary bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded px-2 py-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setRenaming(false)}
          className="rounded px-1 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </form>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={loading}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-[160px] rounded-xl border border-border-secondary bg-popover shadow-lg">
          <div className="p-1">
            <button
              type="button"
              onClick={() => { setOpen(false); setRenaming(true); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Rename
            </button>

            {currentStatus === "ACTIVE" ? (
              <button
                type="button"
                onClick={handlePause}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Pause className="h-4 w-4 text-muted-foreground" />
                Pause monitoring
              </button>
            ) : currentStatus === "PAUSED" ? (
              <button
                type="button"
                onClick={handleResume}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Play className="h-4 w-4 text-muted-foreground" />
                Resume monitoring
              </button>
            ) : null}

            <div className="mx-2 my-1 border-t border-border-secondary" />

            <button
              type="button"
              onClick={handleRemove}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
