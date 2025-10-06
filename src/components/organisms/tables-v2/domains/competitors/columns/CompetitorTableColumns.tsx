"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Competitor } from "../CompetitorTable";
import { SelectionCell } from "../../../components/cells";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Edit01, 
  Copy01, 
  Trash01, 
  CheckCircle, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "@untitledui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVertical } from "@untitledui/icons";

// Badge classes for categories
const badgeClasses: Record<string, string> = {
  Active: 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]',
  Inactive: 'border-[#E9EAEB] bg-[#FAFAFA] text-muted-foreground',
  'In Stock': 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]',
  'Out of Stock': 'border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]',
  'Customer data': 'border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]',
  'Business data': 'border-[#E9D7FE] bg-[#F9F5FF] text-[#6941C6]',
  Admin: 'border-[#C7D7FE] bg-[#EEF4FF] text-[#3538CD]',
  Financials: 'border-[#FCCEEE] bg-[#FDF2FA] text-[#C11574]',
  'Database access': 'border-[#D5D9EB] bg-[#F8F9FC] text-[#363F72]',
  Salesforce: 'border-[#F9DBAF] bg-[#FEF6EE] text-[#B93815]',
};

// Utility functions for price formatting
const fmtPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const fmtDiff = (diff: number) => {
  const sign = diff > 0 ? '+' : '';
  return `${sign}${fmtPrice(diff)}`;
};

const fmtPct = (percent: number) => {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${Math.abs(percent).toFixed(2)}%`;
};

// Price Position Component
const PricePositionCell = ({
  competitorPrice,
  myPrice,
}: {
  competitorPrice: number;
  myPrice: number;
}) => {
  // Guard: division by 0 / bad inputs
  const invalid = !(competitorPrice > 0 && Number.isFinite(competitorPrice) && Number.isFinite(myPrice));
  if (invalid) {
    return (
      <div className="min-w-[280px]">
        <span
          role="status"
          className="inline-flex items-center gap-1 rounded-md border border-[#E9EAEB] bg-[#FAFAFA] px-2 py-0.5 text-xs font-medium text-muted-foreground"
          aria-label="Price comparison not available"
        >
          N/A
        </span>
        <div className="mt-1 text-[11px] text-muted-foreground">Missing or invalid competitor price.</div>
      </div>
    );
  }

  const priceDiff = myPrice - competitorPrice;
  const pctDiff = (priceDiff / competitorPrice) * 100;

  const isEqual = priceDiff === 0;
  const isWinning = priceDiff < 0;

  const colors = isEqual
    ? { bg: 'bg-muted dark:bg-gray-700', text: 'text-muted-foreground dark:text-gray-300', border: 'border-[#E9EAEB] dark:border-gray-600' }
    : isWinning
    ? { bg: 'bg-[#ECFDF3] dark:bg-green-900', text: 'text-[#067647] dark:text-green-300', border: 'border-[#ABEFC6] dark:border-green-700' }
    : { bg: 'bg-[#FEF3F2] dark:bg-red-900', text: 'text-[#B42318] dark:text-red-300', border: 'border-[#FECDCA] dark:border-red-700' };

  const statusText = isEqual ? 'Equal' : isWinning ? 'You Win' : 'You Lose';

  // Keep your "fraction of competitor" bar. 50% == equal.
  const progress = isEqual ? 50 : (competitorPrice / (competitorPrice + myPrice)) * 100;

  const srId = React.useId();

  return (
    <div
      className="group relative min-w-[280px] space-y-2"
      role="region"
      aria-label="Price comparison"
      aria-describedby={srId}
    >
      {/* SR-only descriptive text */}
      <div id={srId} className="sr-only">
        Competitor price {fmtPrice(competitorPrice)}. Your price {fmtPrice(myPrice)}.
        Status: {statusText}. Difference {fmtDiff(priceDiff)} ({fmtPct(pctDiff)}).
      </div>

      {/* Compact numbers */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#EEF4FF] dark:bg-blue-900" aria-hidden="true">
            <svg className="h-3.5 w-3.5 text-[#3538CD]" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 6L8 2L14 6M3 13.5V7M13 13.5V7M2 13.5H14M5.5 13.5V10H10.5V13.5" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-medium text-muted-foreground dark:text-gray-400">Comp. Price</div>
            <div className="font-semibold text-primary" aria-label={`Competitor price: ${fmtPrice(competitorPrice)}`}>
              {fmtPrice(competitorPrice)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div>
            <div className="text-right text-[10px] font-medium text-muted-foreground dark:text-gray-400">My Price</div>
            <div className="text-right font-semibold text-primary" aria-label={`Your price: ${fmtPrice(myPrice)}`}>
              {fmtPrice(myPrice)}
            </div>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#F4EBFF] dark:bg-purple-900" aria-hidden="true">
            <svg className="h-3.5 w-3.5 text-[#7F56D9]" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14A6 6 0 108 2a6 6 0 000 12zM8 5.33V8m0 2.67h.007" />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="relative"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-valuetext={`${statusText} (${fmtPct(pctDiff)})`}
        aria-label="Price comparison progress"
      >
        <div className="h-2 overflow-hidden rounded-full bg-[#E9EAEB] dark:bg-gray-600">
          <div
            className={`h-full transition-all duration-300 ${isWinning ? 'bg-[#17B26A]' : isEqual ? 'bg-[#717680]' : 'bg-[#F04438]'}`}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${progress}%` }}
          aria-hidden="true"
        >
          <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm ${isWinning ? 'bg-[#17B26A]' : isEqual ? 'bg-[#717680]' : 'bg-[#F04438]'}`}>
            <div className="h-full w-full rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Hidden meter for proper measurement semantics */}
      <meter className="sr-only" min={0} max={100} value={Math.round(progress)}>
        {statusText} ({fmtPct(pctDiff)})
      </meter>

      {/* Status + diff */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${colors.border} ${colors.bg} ${colors.text}`} role="status">
          {!isEqual && (isWinning ? <ArrowDown className="h-3 w-3" aria-hidden="true" /> : <ArrowUp className="h-3 w-3" aria-hidden="true" />)}
          <span>{statusText}</span>
        </div>
        {!isEqual && (
          <div className={`text-xs font-semibold ${colors.text}`}>
            {fmtDiff(priceDiff)} ({fmtPct(pctDiff)})
          </div>
        )}
      </div>

      {/* Tooltip: now keyboard-friendly via focus-within */}
      <div
        className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-[320px] rounded-lg border border-[#E9EAEB] bg-white p-4 shadow-lg group-hover:block group-focus-within:block"
        role="tooltip"
        aria-hidden="true"
      >
        <div className="space-y-3">
          <div className="text-sm font-semibold text-primary">Price Analysis</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 rounded-lg bg-[#EEF4FF] p-3">
              <div className="text-xs text-muted-foreground">Competitor</div>
              <div className="text-lg font-bold text-[#3538CD]">{fmtPrice(competitorPrice)}</div>
            </div>
            <div className="space-y-1 rounded-lg bg-[#F4EBFF] p-3">
              <div className="text-xs text-muted-foreground">Your Price</div>
              <div className="text-lg font-bold text-[#7F56D9]">{fmtPrice(myPrice)}</div>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-[#E9EAEB] bg-[#FAFAFA] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Difference:</span>
              <span className={`text-sm font-semibold ${colors.text}`}>{fmtDiff(priceDiff)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Percentage:</span>
              <span className={`text-sm font-semibold ${colors.text}`}>{fmtPct(pctDiff)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border-secondary pt-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <span className={`text-sm font-bold ${colors.text}`}>{statusText}</span>
            </div>
          </div>
          {!isEqual && (
            <div className={`rounded-lg p-2 text-xs ${colors.bg}`}>
              <span className={colors.text}>
                {isWinning
                  ? `💡 Great! You're ${fmtPct(-pctDiff)} cheaper than your competitor.`
                  : `⚠️ Consider adjusting your price. You're ${fmtPct(pctDiff)} more expensive.`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function CompetitorTableColumns(competitors: Competitor[] = []): ColumnDef<Competitor>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <SelectionCell
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          ariaLabel="Select all competitors on current page"
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        />
      ),
      cell: ({ row }) => (
        <SelectionCell
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          ariaLabel={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const competitor = row.original;
        return (
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-full border border-black/8 dark:border-gray-600 bg-gray-200 dark:bg-gray-600"
              aria-hidden="true"
            />
            <div>
              <div className="text-sm font-medium text-foreground">{competitor.name}</div>
              <div className="text-sm text-muted-foreground">{competitor.domain}</div>
            </div>
          </div>
        );
      },
      filterFn: "includesString",
      size: 250,
    },
    {
      accessorKey: "name",
      header: "Matched Product",
      cell: ({ row }) => {
        const competitor = row.original;
        return (
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-full border border-black/8 bg-gray-200"
              aria-hidden="true"
            />
            <div>
              <div className="text-sm font-medium text-foreground">{competitor.name}</div>
              <div className="text-sm text-muted-foreground">{competitor.domain}</div>
            </div>
          </div>
        );
      },
      size: 250,
    },
    {
      id: "pricePosition",
      header: "Price Position",
      cell: ({ row }) => (
        <PricePositionCell 
          competitorPrice={row.original.competitorPrice} 
          myPrice={row.original.myPrice}
        />
      ),
      size: 300,
    },
    {
      id: "trend",
      header: "Trend",
      cell: ({ row }) => {
        const competitor = row.original;
        const priceDiff = competitor.myPrice - competitor.competitorPrice;
        const pctDiff = (priceDiff / competitor.competitorPrice) * 100;
        const isEqual = priceDiff === 0;
        const isWinning = priceDiff < 0;
        
        const label = isEqual
          ? 'Prices equal'
          : isWinning
          ? `You are ${Math.abs(pctDiff).toFixed(2)}% cheaper than competitor`
          : `You are ${pctDiff.toFixed(2)}% more expensive than competitor`;
        
        return (
          <div 
            className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 ${
              isEqual
                ? 'border-[#E9EAEB] bg-[#FAFAFA]'
                : isWinning
                ? 'border-[#ABEFC6] bg-[#ECFDF3]'
                : 'border-[#FECDCA] bg-[#FEF3F2]'
            }`}
            role="img"
            aria-label={label}
          >
            {!isEqual && (isWinning ? (
              <ArrowUp className="h-3 w-3 text-[#17B26A]" aria-hidden="true" />
            ) : (
              <ArrowDown className="h-3 w-3 text-[#F04438]" aria-hidden="true" />
            ))}
            <span className={`text-xs font-medium ${isEqual ? 'text-muted-foreground' : isWinning ? 'text-[#067647]' : 'text-[#B42318]'}`}>
              {isEqual ? '0%' : `${Math.abs(pctDiff).toFixed(1)}%`}
            </span>
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "categories",
      header: "Categories",
      cell: ({ row }) => {
        const categories = row.getValue("categories") as string[];
        return (
          <div className="flex flex-wrap items-center gap-1" role="list" aria-label="Product categories">
            {categories.slice(0, 2).map(category => (
              <span
                key={category}
                role="listitem"
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClasses[category] ?? 'border-[#E9EAEB] bg-[#FAFAFA] text-muted-foreground'}`}
                aria-label={`Category: ${category}`}
              >
                {category === 'Active' && <span className="h-2 w-2 rounded-full bg-[#17B26A]" aria-hidden="true" />}
                {category === 'Inactive' && <span className="h-2 w-2 rounded-full bg-[#717680]" aria-hidden="true" />}
                {category === 'In Stock' && <span className="h-2 w-2 rounded-full bg-[#17B26A]" aria-hidden="true" />}
                {category === 'Out of Stock' && <span className="h-2 w-2 rounded-full bg-[#F04438]" aria-hidden="true" />}
                {category}
              </span>
            ))}
            {categories.length > 2 && (
              <span 
                className="inline-flex items-center rounded-full border border-[#E9EAEB] bg-[#FAFAFA] px-2 py-0.5 text-xs font-medium text-muted-foreground"
                role="listitem"
                aria-label={`${categories.length - 2} additional categories`}
              >
                +{categories.length - 2}
              </span>
            )}
          </div>
        );
      },
      size: 200,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const competitor = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                aria-label={`Actions for ${competitor.name}`}
              >
                <DotsVertical className="h-4 w-4" aria-hidden={true} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => console.log("View", competitor.id)}
                aria-label={`View details for ${competitor.name}`}
              >
                <Eye className="mr-2 h-4 w-4" aria-hidden={true} />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => console.log("Edit", competitor.id)}
                aria-label={`Edit ${competitor.name}`}
              >
                <Edit01 className="mr-2 h-4 w-4" aria-hidden={true} />
                Edit Competitor
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(competitor.domain)}
                aria-label={`Copy domain ${competitor.domain} to clipboard`}
              >
                <Copy01 className="mr-2 h-4 w-4" aria-hidden={true} />
                Copy Domain
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => console.log("Delete", competitor.id)}
                aria-label={`Delete ${competitor.name}`}
                className="text-red-600 focus:text-red-600"
              >
                <Trash01 className="mr-2 h-4 w-4" aria-hidden={true} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 60,
    },
  ];
}
