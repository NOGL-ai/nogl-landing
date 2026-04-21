"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw01 as RefreshCcw, Save01 as SavePresetIcon, Settings01 as Settings } from "@untitledui/icons";

import { Card } from "@/components/ui/card";
import Checkbox from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MatrixDimension } from "@/lib/analytics/product-matrix-helpers";
import {
  CAMERA_QUICK_FILTERS,
  MATRIX_DIMENSIONS,
  isMatrixDimension,
} from "@/lib/analytics/product-matrix-helpers";

const PRESET_STORAGE = "nogl-product-matrix-presets-v1";

const ALL_SLUGS = [
  "calumet",
  "teltec",
  "foto-erhardt",
  "foto-leistenschneider",
  "fotokoch",
  "kamera-express",
] as const;

const INITIAL_TRACKED: { slug: string; name: string }[] = [
  { slug: "calumet", name: "Calumet Photographic" },
  { slug: "teltec", name: "Teltec" },
  { slug: "foto-erhardt", name: "Foto Erhardt" },
  { slug: "foto-leistenschneider", name: "Foto Leistenschneider" },
  { slug: "fotokoch", name: "Fotokoch" },
  { slug: "kamera-express", name: "Kamera Express" },
];

type TrackedCo = { slug: string; name: string };

type MatrixResponse = {
  meta: {
    row: MatrixDimension;
    col: MatrixDimension;
    depth: number;
    companies: string[];
    tracked_companies: TrackedCo[];
    row_keys: string[];
    col_keys: string[];
    max_cell: number;
    camera_filters: { id: string; label: string }[];
  };
  cells: { row_key: string; col_key: string; n: number }[];
};

type PresetV1 = {
  id: string;
  name: string;
  createdAt: string;
  v: 1;
  q: Record<string, string>;
};

function heatClass(n: number, max: number): string {
  if (max <= 0 || n <= 0) return "bg-muted/40 text-muted-foreground";
  const r = n / max;
  if (r >= 0.85) return "bg-orange-600 text-white dark:bg-orange-700";
  if (r >= 0.65) return "bg-orange-500/95 text-white dark:bg-orange-600";
  if (r >= 0.45) return "bg-orange-400/90 text-foreground dark:bg-orange-500/80";
  if (r >= 0.25) return "bg-orange-200/90 text-foreground dark:bg-orange-900/30";
  if (r >= 0.08) return "bg-orange-100/80 text-foreground dark:bg-orange-950/40";
  return "bg-background text-foreground";
}

function loadPresets(): PresetV1[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRESET_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PresetV1[];
    return Array.isArray(parsed) ? parsed.filter((p) => p.v === 1 && p.q) : [];
  } catch {
    return [];
  }
}

function savePresets(list: PresetV1[]) {
  window.localStorage.setItem(PRESET_STORAGE, JSON.stringify(list.slice(0, 24)));
}

function buildQuery(params: Record<string, string | undefined>): string {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") u.set(k, v);
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}

function dimLabel(d: MatrixDimension): string {
  return (
    {
      company: "Company",
      category: "Product category",
      brand: "Brand",
      price_bucket: "Price bucket",
      discount_tier: "Discount tier",
    } as const
  )[d];
}

export function ProductMatrixClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rowDim, setRowDim] = useState<MatrixDimension>("company");
  const [colDim, setColDim] = useState<MatrixDimension>("category");
  const [depth, setDepth] = useState(3);
  const [keyword, setKeyword] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [gender, setGender] = useState("");
  const [avgDiscount, setAvgDiscount] = useState("any");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [cameraIds, setCameraIds] = useState<string[]>([]);
  const [matchAll, setMatchAll] = useState(true);

  const [data, setData] = useState<MatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<PresetV1[]>([]);

  const [presetsOpen, setPresetsOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [drill, setDrill] = useState<{ row: string; col: string; n: number } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hydrateFromUrl = useCallback(() => {
    const g = (k: string) => searchParams.get(k) ?? "";
    const r = g("row");
    const c = g("col");
    if (isMatrixDimension(r)) setRowDim(r);
    if (isMatrixDimension(c)) setColDim(c);
    const d = Number(g("depth"));
    if (!Number.isNaN(d) && d >= 1 && d <= 5) setDepth(d);
    setKeyword(g("keyword"));
    setMaterial(g("material"));
    setColor(g("color"));
    setGender(g("gender"));
    setAvgDiscount(g("avgDiscount") || "any");
    const co = g("companies");
    setSelectedSlugs(co ? co.split(",").filter(Boolean) : []);
    const cam = g("camera");
    setCameraIds(cam ? cam.split(",").filter(Boolean) : []);
    setMatchAll(g("matchAll") !== "0");
  }, [searchParams]);

  useEffect(() => {
    hydrateFromUrl();
  }, [hydrateFromUrl]);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const queryForApi = useMemo(() => {
    const allCount = ALL_SLUGS.length;
    const subset =
      selectedSlugs.length > 0 && selectedSlugs.length < allCount ? selectedSlugs.join(",") : undefined;
    const params: Record<string, string | undefined> = {
      row: rowDim,
      col: colDim,
      depth: String(depth),
      keyword: keyword.trim() || undefined,
      material: material.trim() || undefined,
      color: color.trim() || undefined,
      gender: gender || undefined,
      avgDiscount: avgDiscount === "any" ? undefined : avgDiscount,
      companies: subset,
      camera: cameraIds.length ? cameraIds.join(",") : undefined,
      matchAll: matchAll ? "1" : "0",
    };
    return params;
  }, [
    rowDim,
    colDim,
    depth,
    keyword,
    material,
    color,
    gender,
    avgDiscount,
    selectedSlugs,
    cameraIds,
    matchAll,
  ]);

  const pushUrl = useCallback(() => {
    const q = buildQuery(queryForApi as Record<string, string>);
    router.replace(`${pathname}${q}`, { scroll: false });
  }, [pathname, queryForApi, router]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushUrl(), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pushUrl]);

  useEffect(() => {
    if (rowDim === colDim) {
      setColDim(rowDim === "company" ? "category" : "company");
    }
  }, [rowDim, colDim]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        Object.entries(queryForApi).forEach(([k, v]) => {
          if (v) qs.set(k, v);
        });
        const res = await fetch(`/api/analytics/product-matrix?${qs.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as MatrixResponse & { error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
        if (!cancelled) setData(json as MatrixResponse);
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryForApi]);

  const cellMap = useMemo(() => {
    const m = new Map<string, number>();
    if (!data) return m;
    for (const c of data.cells) {
      m.set(`${c.row_key}\0${c.col_key}`, c.n);
    }
    return m;
  }, [data]);

  const maxCell = data?.meta.max_cell ?? 0;

  const displayTracked =
    data?.meta.tracked_companies?.length ? data.meta.tracked_companies : INITIAL_TRACKED;

  const resetFilters = () => {
    setKeyword("");
    setMaterial("");
    setColor("");
    setGender("");
    setAvgDiscount("any");
    setSelectedSlugs([]);
    setCameraIds([]);
    setDepth(3);
    setMatchAll(true);
    setRowDim("company");
    setColDim("category");
    router.replace(pathname, { scroll: false });
  };

  const snapshotQuery = () => {
    const q: Record<string, string> = {};
    Object.entries(queryForApi).forEach(([k, v]) => {
      if (v) q[k] = v;
    });
    return q;
  };

  const savePreset = () => {
    const name = window.prompt("Preset name");
    if (!name?.trim()) return;
    const next: PresetV1 = {
      id: `p_${Date.now()}`,
      name: name.trim().slice(0, 80),
      createdAt: new Date().toISOString(),
      v: 1,
      q: snapshotQuery(),
    };
    const list = [next, ...presets.filter((p) => p.name !== next.name)].slice(0, 24);
    setPresets(list);
    savePresets(list);
    setPresetsOpen(false);
  };

  const applyPreset = (p: PresetV1) => {
    const q = p.q;
    const r = q.row;
    const c = q.col;
    if (isMatrixDimension(r)) setRowDim(r);
    if (isMatrixDimension(c)) setColDim(c);
    const d = Number(q.depth);
    if (!Number.isNaN(d) && d >= 1 && d <= 5) setDepth(d);
    setKeyword(q.keyword ?? "");
    setMaterial(q.material ?? "");
    setColor(q.color ?? "");
    setGender(q.gender ?? "");
    setAvgDiscount(q.avgDiscount || "any");
    setSelectedSlugs(q.companies ? q.companies.split(",").filter(Boolean) : []);
    setCameraIds(q.camera ? q.camera.split(",").filter(Boolean) : []);
    setMatchAll(q.matchAll !== "0");
    setPresetsOpen(false);
  };

  const deletePreset = (id: string) => {
    const list = presets.filter((p) => p.id !== id);
    setPresets(list);
    savePresets(list);
  };

  const companyChecked = (slug: string) => selectedSlugs.length === 0 || selectedSlugs.includes(slug);

  const toggleCompany = (slug: string, checked: boolean) => {
    setSelectedSlugs((prev) => {
      const all = [...ALL_SLUGS];
      if (prev.length === 0) {
        if (!checked) return all.filter((s) => s !== slug);
        return [];
      }
      const next = checked ? [...new Set([...prev, slug])] : prev.filter((s) => s !== slug);
      if (next.length === 0) return [];
      if (next.length === all.length) return [];
      return next;
    });
  };

  const toggleCamera = (id: string) => {
    setCameraIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openCell = (row: string, col: string) => {
    const n = cellMap.get(`${row}\0${col}`) ?? 0;
    setDrill({ row, col, n });
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Product Matrix</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Pivot the tracked catalog across companies and dimensions. Presets stay in this browser (localStorage).
            SKU-level lists live in{" "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/en/analytics/multi-company">
              Competitive Compare
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden />
            Reset filters
          </button>

          <Popover open={presetsOpen} onOpenChange={setPresetsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                <SavePresetIcon className="h-4 w-4" aria-hidden />
                Presets
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-semibold text-foreground">Presets</p>
                <p className="text-[11px] text-muted-foreground">Saved on this device only.</p>
              </div>
              <div className="p-2">
                <button
                  type="button"
                  onClick={savePreset}
                  className="w-full rounded-md px-2 py-2 text-left text-sm font-medium hover:bg-muted"
                >
                  + Save filters as preset
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto border-t border-border p-2">
                {presets.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">No presets yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {presets.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-muted">
                        <button type="button" className="min-w-0 flex-1 truncate text-left text-sm" onClick={() => applyPreset(p)}>
                          {p.name}
                        </button>
                        <button
                          type="button"
                          className="shrink-0 text-xs text-destructive hover:underline"
                          onClick={() => deletePreset(p.id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={layoutOpen} onOpenChange={setLayoutOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Settings className="h-4 w-4" aria-hidden />
                Matrix layout
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Rows</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5"
                    value={rowDim}
                    onChange={(e) => setRowDim(e.target.value as MatrixDimension)}
                  >
                    {MATRIX_DIMENSIONS.filter((d) => d !== colDim).map((d) => (
                      <option key={d} value={d}>
                        {dimLabel(d)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Columns</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5"
                    value={colDim}
                    onChange={(e) => setColDim(e.target.value as MatrixDimension)}
                  >
                    {MATRIX_DIMENSIONS.filter((d) => d !== rowDim).map((d) => (
                      <option key={d} value={d}>
                        {dimLabel(d)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Taxonomy depth (1–5)</Label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Minimum category path segments: {depth}</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <Card className="border-border p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={matchAll} onChange={(v) => setMatchAll(v)} ariaLabel="Match all filters" />
              <span>Include items matching all filters</span>
            </label>
            <span className="text-xs text-muted-foreground">
              AND across keyword, material, color, gender, discount, camera chips, and company subset.
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs font-medium text-muted-foreground">Companies (none checked = all tracked)</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {displayTracked.map((c) => (
                  <label key={c.slug} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={companyChecked(c.slug)}
                      onChange={(v) => toggleCompany(c.slug, v)}
                      ariaLabel={c.name}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              {selectedSlugs.length > 0 && (
                <button type="button" className="mt-2 text-xs text-primary hover:underline" onClick={() => setSelectedSlugs([])}>
                  Use all companies
                </button>
              )}
            </div>
            <div>
              <Label htmlFor="pm-keyword">Keyword</Label>
              <input
                id="pm-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Title, SKU, EAN…"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="pm-material">Material</Label>
              <input
                id="pm-material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. carbon, aluminum"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="pm-color">Color</Label>
              <input
                id="pm-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. black"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="pm-gender">Gender</Label>
              <select
                id="pm-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <Label htmlFor="pm-discount">Avg. discount floor</Label>
              <select
                id="pm-discount"
                value={avgDiscount}
                onChange={(e) => setAvgDiscount(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="any">Any</option>
                <option value="10">≥ 10%</option>
                <option value="20">≥ 20%</option>
                <option value="30">≥ 30%</option>
                <option value="50">≥ 50%</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs font-medium text-muted-foreground">Camera / optics quick filters</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CAMERA_QUICK_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleCamera(f.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      cameraIds.includes(f.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-border p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {dimLabel(rowDim)} × {dimLabel(colDim)}
          </h2>
          {loading && <span className="text-xs text-muted-foreground">Loading…</span>}
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
        <div className="max-h-[min(70vh,720px)] overflow-auto">
          {!data || data.meta.row_keys.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No matrix cells for this configuration.</p>
          ) : (
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-20 border-b border-r border-border bg-card px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {dimLabel(rowDim)} \ {dimLabel(colDim)}
                  </th>
                  {data.meta.col_keys.map((ck) => (
                    <th
                      key={ck}
                      scope="col"
                      className="min-w-[5rem] border-b border-border bg-card px-2 py-2 text-center text-[10px] font-semibold uppercase leading-tight text-muted-foreground sm:text-xs"
                      title={ck}
                    >
                      <span className="line-clamp-3">{ck}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.meta.row_keys.map((rk) => (
                  <tr key={rk} className="border-b border-border">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r border-border bg-background px-2 py-1.5 text-left text-xs font-medium text-foreground"
                      title={rk}
                    >
                      <span className="line-clamp-3">{rk}</span>
                    </th>
                    {data.meta.col_keys.map((ck) => {
                      const n = cellMap.get(`${rk}\0${ck}`) ?? 0;
                      return (
                        <td key={ck} className="border-l border-border/60 p-0.5 text-center align-middle">
                          <button
                            type="button"
                            tabIndex={0}
                            onClick={() => openCell(rk, ck)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openCell(rk, ck);
                              }
                            }}
                            className={`h-full min-h-[2.5rem] w-full rounded px-1 py-2 text-xs font-semibold tabular-nums transition hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${heatClass(n, maxCell)}`}
                            aria-label={`${rk}, ${ck}, ${n} products`}
                          >
                            {n > 0 ? n.toLocaleString() : "—"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Cell drill-down</SheetTitle>
            <SheetDescription>
              Counts are aggregated in-database. Open Competitive Compare or a company workspace for SKU-level lists.
            </SheetDescription>
          </SheetHeader>
          {drill && (
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Row ({dimLabel(rowDim)})</p>
                <p className="mt-1 font-medium text-foreground">{drill.row}</p>
                <p className="mt-3 text-xs uppercase text-muted-foreground">Column ({dimLabel(colDim)})</p>
                <p className="mt-1 font-medium text-foreground">{drill.col}</p>
                <p className="mt-3 text-xs uppercase text-muted-foreground">Matching products</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{drill.n.toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/en/analytics/multi-company"
                  className="inline-flex justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Open competitive compare
                </Link>
                <p className="text-xs text-muted-foreground">
                  Deep links that auto-apply these row/column slices are planned; filters can be reapplied manually on the
                  next screen.
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
