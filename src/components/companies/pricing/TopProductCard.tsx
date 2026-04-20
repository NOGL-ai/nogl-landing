import { LinkExternal01 as ExternalLink } from '@untitledui/icons';
"use client";


import type { CompanyPricingTopProduct } from "@/types/company";
import { fmtPrice } from "./utils";

interface TopProductCardProps {
  rank: number;
  product: CompanyPricingTopProduct;
}

export function TopProductCard({ rank, product }: TopProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="absolute left-2 top-2 z-10 flex h-6 min-w-[24px] items-center justify-center rounded bg-foreground px-1.5 text-xs font-bold text-background">
        #{rank}
      </div>

      <div className="flex h-44 items-center justify-center overflow-hidden bg-muted/30">
        {product.product_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.product_image_url}
            alt={product.product_title}
            className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
          {product.product_title}
        </p>
        <p className="text-sm font-semibold text-foreground">
          {product.discount_price != null ? (
            <>
              <span className="mr-1 text-xs font-normal line-through text-muted-foreground">
                {fmtPrice(product.original_price)}
              </span>
              <span className="text-emerald-500">{fmtPrice(product.discount_price)}</span>
            </>
          ) : (
            fmtPrice(product.original_price)
          )}
        </p>
        <div className="mt-auto flex gap-1.5">
          <button
            type="button"
            className="flex-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            Explore
          </button>
          {product.product_url && (
            <a
              href={product.product_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
