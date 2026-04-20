# Forecast demo datasets

Raw CSV / ZIP files here are **not committed** (see root `.gitignore`).
Download them locally before running `npm run seed:forecast-demo`.

## Required — Fujifilm Instax (primary demand signal)

- Source: https://www.kaggle.com/datasets/bertnardomariouskono/fujifilm-instax-sales-transaction-data-synthetic
- License: CC0 Public Domain
- Why: ~10k transactions across 3 years (May 2022 – May 2025), 10/10 camera
  relevance, captures seasonality + promotional elasticity + multi-channel
  (physical store + Tokopedia + Shopee).

### Download with the Kaggle CLI

```bash
# one-time: pip install --user kaggle && place kaggle.json at ~/.kaggle/
cd scripts/data
kaggle datasets download -d bertnardomariouskono/fujifilm-instax-sales-transaction-data-synthetic
unzip fujifilm-instax-sales-transaction-data-synthetic.zip
mv *.csv fujifilm-instax.csv
```

### Expected filename

`scripts/data/fujifilm-instax.csv` — the seed script fails fast with a clear
error message if this file is missing.

### Expected columns

`Tanggal`, `Kategori`, `Nama_Produk`, `Harga_Satuan`, `Qty`, `Diskon_IDR`,
`Method`, `Store` (whitespace and column-count variance are tolerated).

## Optional enrichment — not wired in this slice

These datasets are documented for future enrichment prompts. The current seed
works without them.

### Amazon Electronics Products Sales Dataset 42K+ (2025)

- Source: https://www.kaggle.com/datasets/ikramshah512/amazon-products-sales-dataset-42k-items-2025
- License: CC0
- Planned use: enrich the Calumet catalog with realistic price distributions,
  ratings, and best-seller flags when we need more SKUs than Instax provides.

### Global Electronics Retailers

- Source: https://www.kaggle.com/datasets/bhavikjikadara/global-electronics-retailers
- License: CC BY 4.0
- Planned use: multi-store / multi-channel demand mapping for a richer
  channel-split than the Instax `Method` column gives us.

## Reference only — do NOT download

### FreshRetailNet-50K

- Source: https://huggingface.co/datasets/Dingdong-Inc/FreshRetailNet-50K
- License: CC BY 4.0
- Purpose: **methodology reference only.** It is the only public dataset
  with explicit stockout labels; we replicate its MNAR latent-demand recovery
  approach in the `applyCensoredDemandMethodology` step of the seed script.
  The grocery data itself is not camera-relevant and is not ingested.
