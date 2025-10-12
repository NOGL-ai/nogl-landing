import React from "react";

export default function GlassBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#7dd3fc]/35 via-[#a78bfa]/30 to-[#22d3ee]/25 blur-3xl" />
      <div className="absolute -bottom-40 -right-20 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-[#22d3ee]/32 via-[#38bdf8]/28 to-[#a78bfa]/22 blur-3xl" />
      <div className="absolute inset-0 backdrop-blur-[4px] bg-white/12 dark:bg-black/18" />
    </div>
  );
}
