"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadAsset, triggerRun } from "@/lib/ad-scoring/client";
import type { Platform, AssetType } from "@/lib/ad-scoring/types";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram_reels", label: "Instagram Reels" },
  { value: "instagram_stories", label: "Instagram Stories" },
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "meta_feed", label: "Meta Feed" },
];

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; progress: string }
  | { phase: "finalizing" }
  | { phase: "triggering" }
  | { phase: "done"; assetId: string; runId: string }
  | { phase: "error"; message: string };

export default function AssetUploadForm() {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setState({ phase: "idle" });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const assetType = (f: File): AssetType =>
    f.type.startsWith("video/") ? "video" : "image";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setState({ phase: "uploading", progress: "Uploading to S3…" });
      const asset = await uploadAsset(file, {
        platform,
        asset_type: assetType(file),
      });

      setState({ phase: "triggering" });
      const run = await triggerRun(asset.id);

      setState({ phase: "done", assetId: asset.id, runId: run.id });
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Platform selector */}
      <div>
        <label
          htmlFor="platform"
          className="block text-xs font-medium text-muted-foreground mb-1.5"
        >
          Platform
        </label>
        <select
          id="platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
          drag
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <UploadCloud
            className={`h-8 w-8 mb-2 ${drag ? "text-primary" : "text-muted-foreground"}`}
          />
          {file ? (
            <div>
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024 / 1024).toFixed(1)} MB · {assetType(file)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                Drop an image or video here, or{" "}
                <span className="text-primary font-medium">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP, MP4, MOV — max 500 MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status display */}
      {state.phase !== "idle" && (
        <div
          className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
            state.phase === "done"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              : state.phase === "error"
              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {state.phase === "uploading" || state.phase === "finalizing" || state.phase === "triggering" ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : state.phase === "done" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {state.phase === "uploading" && state.progress}
          {state.phase === "finalizing" && "Finalizing upload…"}
          {state.phase === "triggering" && "Starting analysis pipeline…"}
          {state.phase === "done" && (
            <span>
              Pipeline running!{" "}
              <a
                href={`/ad-scoring/analysis/${state.runId}`}
                className="underline font-medium"
              >
                View report →
              </a>
            </span>
          )}
          {state.phase === "error" && state.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!file || state.phase === "uploading" || state.phase === "finalizing" || state.phase === "triggering"}
        className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {(state.phase === "uploading" || state.phase === "finalizing" || state.phase === "triggering") && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Upload & Score
      </button>
    </form>
  );
}
