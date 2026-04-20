"use client";

import { Loading01 as Loader2, CheckCircle as CheckCircle2, AlertCircle } from '@untitledui/icons';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { decideReview } from "@/lib/ad-scoring/client";
import type { ReviewDecision } from "@/lib/ad-scoring/types";

interface Props {
  reviewId: string;
}

const DECISIONS: { value: ReviewDecision["decision"]; label: string; desc: string }[] = [
  {
    value: "approved",
    label: "Approve",
    desc: "Creative meets this criterion as reviewed.",
  },
  {
    value: "rejected",
    label: "Reject",
    desc: "Creative does not meet the criterion — flag for revision.",
  },
  {
    value: "dismissed",
    label: "Dismiss",
    desc: "Not applicable to this campaign / cannot assess from available evidence.",
  },
];

type FormState = "idle" | "submitting" | "done" | "error";

export default function ReviewDecisionForm({ reviewId }: Props) {
  const router = useRouter();
  const [decision, setDecision] = useState<ReviewDecision["decision"] | "">("");
  const [notes, setNotes] = useState("");
  const [assignee, setAssignee] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) return;

    setFormState("submitting");
    setErrorMsg("");

    try {
      await decideReview(reviewId, {
        decision,
        decision_notes: notes.trim() || undefined,
        assignee: assignee.trim() || undefined,
      });
      setFormState("done");
      // Refresh the page to show the closed state
      setTimeout(() => router.refresh(), 800);
    } catch (err) {
      setFormState("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    }
  };

  if (formState === "done") {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 flex items-center gap-3 text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Decision submitted.</p>
          <p className="text-sm opacity-80">Refreshing page…</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Decision radio group */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Decision <span className="text-red-500">*</span>
        </p>
        <div className="space-y-2">
          {DECISIONS.map((d) => (
            <label
              key={d.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                decision === d.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              <input
                type="radio"
                name="decision"
                value={d.value}
                checked={decision === d.value}
                onChange={() => setDecision(d.value)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-xs font-medium text-muted-foreground mb-1.5"
        >
          Notes{decision === "rejected" && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explain your decision — context for the advertiser and future reviewers."
          required={decision === "rejected"}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Assignee */}
      <div>
        <label
          htmlFor="assignee"
          className="block text-xs font-medium text-muted-foreground mb-1.5"
        >
          Your identifier (email or name)
        </label>
        <input
          id="assignee"
          type="text"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="reviewer@example.com"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Error */}
      {formState === "error" && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!decision || formState === "submitting"}
        className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState === "submitting" && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Submit Decision
      </button>
    </form>
  );
}
