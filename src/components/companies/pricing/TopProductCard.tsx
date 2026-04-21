"use client";
import { LinkExternal01 as ExternalLink } from '@untitledui/icons';



import type { CompanyPricingTopProduct } from "@/types/company";
import { fmtPrice } from "./utils";

interface TopProductCardProps {
  rank: number;
  product: CompanyPricingTopProduct;
}

export function TopProductCard({ rank, product }: TopProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border-primary bg-bg-primary shadow-xs transition-shadow hover:shadow-md">
      <div className="absolute left-2 top-2 z-10 flex h-6 min-w-[24px] items-center justify-center rounded bg-bg-brand-solid px-1.5 text-xs font-bold text-white">
        #{rank}
      </div>

      <div className="flex h-44 items-center justify-center overflow-hidden bg-bg-secondary">
        {product.product_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.product_image_url}
            alt={product.product_title}
            className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-tertiary">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-text-primary">
          {product.product_title}
        </p>
        <p className="text-sm font-semibold text-text-primary">
          {product.discount_price != null ? (
            <>
              <span className="mr-1 text-xs font-normal line-through text-text-tertiary">
                {fmtPrice(product.original_price)}
              </span>
              <span className="text-text-success">{fmtPrice(product.discount_price)}</span>
            </>
          ) : (
            fmtPrice(product.original_price)
          )}
        </p>
        <div className="mt-auto flex gap-1.5">
          <button
            type="button"
            className="flex-1 rounded border border-border-primary px-2 py-1 text-xs text-text-tertiary transition-colors hover:bg-bg-secondary"
          >
            Explore
          </button>
          {product.product_url && (
            <a
              href={product.product_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded border border-border-primary px-2 py-1 text-xs text-text-tertiary transition-colors hover:bg-bg-secondary"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}