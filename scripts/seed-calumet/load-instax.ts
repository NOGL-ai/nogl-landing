/* eslint-disable no-console */
/**
 * Load and parse the Fujifilm Instax CSV into typed rows.
 *
 * CSV columns (12):
 *   Tanggal, Tahun, Bulan, Hari, Kategori, Nama_Produk, Lokasi_Toko,
 *   Metode_Bayar, Harga_Satuan, Qty, Diskon_IDR, Total_Penjualan
 */

import fs from "fs";
import { parse } from "csv-parse/sync";

export interface InstaxRow {
  date: Date;
  category: string;
  productName: string;
  store: string;
  method: string; // Metode_Bayar
  unitPriceIdr: number;
  qty: number;
  discountIdr: number;
  totalIdr: number;
}

/**
 * Parse Indonesian-locale IDR strings like "Rp 1.250.000" or "1.250.000" or
 * plain integers.  Returns 0 on unparseable input.
 */
export function parseIdr(s: string | number | null | undefined): number {
  if (s === null || s === undefined || s === "") return 0;
  if (typeof s === "number") return Number.isFinite(s) ? s : 0;
  // Strip currency prefix and whitespace, then remove thousand separators (.)
  // Indonesian locale uses '.' as thousand sep and ',' as decimal sep.
  const cleaned = String(s)
    .replace(/Rp\s*/i, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")   // thousand separators
    .replace(/,/g, ".");  // decimal comma → decimal point
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Parse date from either "YYYY-MM-DD" or "DD/MM/YYYY" format.
 * Returns null when the string is not a valid date.
 */
function parseDate(s: string): Date | null {
  const trimmed = s.trim();

  // ISO format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, mo, d] = isoMatch;
    const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
    return isNaN(dt.getTime()) ? null : dt;
  }

  // Indonesian format: DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, d, mo, y] = dmyMatch;
    const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null;
}

export function loadInstax(path: string): InstaxRow[] {
  if (!fs.existsSync(path)) {
    console.warn(`[load-instax] CSV not found at ${path} — returning [] (hero SKUs only)`);
    return [];
  }
  const raw = fs.readFileSync(path);
  // Strip UTF-8 BOM if present
  const content = raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf
    ? raw.slice(3).toString("utf8")
    : raw.toString("utf8");

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const rows: InstaxRow[] = [];
  let skipped = 0;

  for (const rec of records) {
    const rawName = (rec["Nama_Produk"] ?? "").trim();

    // Skip header guard rows or empty product names
    if (!rawName || /^Nama_Produk$/i.test(rawName)) {
      skipped++;
      continue;
    }

    const dateStr = (rec["Tanggal"] ?? "").trim();
    const parsedDate = parseDate(dateStr);
    if (!parsedDate) {
      skipped++;
      continue;
    }

    const qty = parseInt(rec["Qty"] ?? "0", 10);
    if (!Number.isFinite(qty)) {
      skipped++;
      continue;
    }

    rows.push({
      date: parsedDate,
      category: (rec["Kategori"] ?? "").trim(),
      productName: rawName,
      store: (rec["Lokasi_Toko"] ?? "").trim(),
      method: (rec["Metode_Bayar"] ?? "").trim(),
      unitPriceIdr: parseIdr(rec["Harga_Satuan"]),
      qty,
      discountIdr: parseIdr(rec["Diskon_IDR"]),
      totalIdr: parseIdr(rec["Total_Penjualan"]),
    });
  }

  console.log(
    `[load-instax] Loaded ${rows.length} rows, skipped ${skipped} (headers/bad dates)`,
  );
  return rows;
}
