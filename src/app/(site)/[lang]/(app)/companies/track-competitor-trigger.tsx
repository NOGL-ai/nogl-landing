import { Plus } from '@untitledui/icons';
"use client";

import React from "react";


import TrackCompetitorModal from "@/components/molecules/TrackCompetitorModal";

export function TrackCompetitorTrigger() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-purple-700 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Track Competitor
      </button>

      <TrackCompetitorModal open={open} onOpenChange={setOpen} />
    </>
  );
}
