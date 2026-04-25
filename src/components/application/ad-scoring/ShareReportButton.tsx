"use client";

import { Copy01 as Copy, CheckCircle as Check } from "@untitledui/icons";
import { useState } from "react";

interface Props {
  /** Run id; the share URL is built from window.location.origin + lang prefix. */
  runId: string;
  /** Locale prefix, e.g. "en". Defaults to the current path's first segment. */
  lang?: string;
}

/**
 * Copy-to-clipboard share button for an analysis report URL.
 * Renders an inline button that flips to a "Copied" state for 2 seconds.
 */
export default function ShareReportButton({ runId, lang = "en" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/${lang}/ad-scoring/analysis/${runId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers / insecure contexts: fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // Give up silently — the user can still copy from the URL bar.
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy share link to this report"
      className="inline-flex items-center gap-1.5 rounded-lg bg-bg-brand-solid px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy share link
        </>
      )}
    </button>
  );
}
