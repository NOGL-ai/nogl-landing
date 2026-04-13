"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function DeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/competitors/${id}`, {
      method: "DELETE",
    });

    if (res.ok || res.status === 204) {
      if (typeof window !== "undefined") {
        window.location.href = "../../";
      }
    } else {
      setLoading(false);
      setConfirming(false);
      alert("Delete failed. Please try again.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        confirming
          ? "bg-red-600 text-white hover:bg-red-700"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      } disabled:opacity-50`}
    >
      {loading ? "Deleting..." : confirming ? "Confirm delete" : "Delete"}
    </button>
  );
}

function MonitoringToggle({
  id,
  initial,
}: {
  id: string;
  initial: boolean;
}) {
  const [isMonitoring, setIsMonitoring] = useState(initial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);

    const res = await fetch(`/api/competitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isMonitoring: !isMonitoring }),
    });

    if (res.ok) {
      setIsMonitoring((prev) => !prev);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        isMonitoring
          ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      } disabled:opacity-50`}
    >
      {loading ? "Saving..." : isMonitoring ? "Monitoring ON" : "Monitoring OFF"}
    </button>
  );
}

function ScrapeButton({ id }: { id: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const router = useRouter();

  async function handleScrape() {
    setStatus("loading");

    const res = await fetch(`/api/competitors/${id}/scrape`, {
      method: "POST",
    });

    if (res.ok || res.status === 202) {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        router.refresh();
      }, 2000);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const label = {
    idle: "Scrape now",
    loading: "Queuing...",
    success: "Queued OK",
    error: "Failed - retry",
  }[status];

  return (
    <button
      onClick={handleScrape}
      disabled={status === "loading"}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        status === "error"
          ? "border border-red-200 bg-red-50 text-red-700"
          : status === "success"
            ? "border border-green-200 bg-green-50 text-green-700"
            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      } disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

export function CompetitorActions({
  id,
  initialMonitoring,
}: {
  id: string;
  initialMonitoring: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <ScrapeButton id={id} />
      <MonitoringToggle id={id} initial={initialMonitoring} />
      <DeleteButton id={id} />
    </div>
  );
}
