"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/base/buttons/button';

export function ExternalTrendsWaitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Coming soon
        </span>
        <h2 className="text-2xl font-bold text-foreground">
          External Trends
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Google Search volume overlaid on your internal movers — see whether
          your fastest-growing categories match consumer demand.
        </p>
      </div>

      {submitted ? (
        <p className="text-sm font-medium text-green-500">
          You&apos;re on the list. We&apos;ll notify you when it launches.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xs flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" color="primary" size="sm">
            Notify me
          </Button>
        </form>
      )}
    </div>
  );
}
