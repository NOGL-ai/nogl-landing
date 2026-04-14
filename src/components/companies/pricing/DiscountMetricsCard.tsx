"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DiscountMetricsCardProps {
  totalDiscounted: number;
  totalProducts: number;
  loading?: boolean;
}

export function DiscountMetricsCard({
  totalDiscounted,
  totalProducts,
  loading = false,
}: DiscountMetricsCardProps) {
  const t = useTranslations("companies");
  const percentage = totalProducts > 0 ? Math.round((totalDiscounted / totalProducts) * 100) : 0;

  if (loading) {
    return <Card className="h-32 animate-pulse bg-muted" />;
  }

  // Calculate donut chart values for 64x64 SVG
  const radius = 29;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="flex flex-col overflow-hidden p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          {t("pricing.totalDiscounted") || "Total Discounted Products"}
        </h3>
        <div
          className="flex items-center justify-center rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
          title={t("pricing.totalDiscountedTooltip") || "Active discounted products where the average current price of its variants is less than the average full price."}
        >
          <Info className="h-4 w-4" />
        </div>
      </div>

      {/* Content - Horizontal Layout */}
      <div className="flex items-center gap-4">
        {/* Donut Chart - Compact */}
        <div className="relative flex flex-shrink-0 items-center justify-center">
          <svg viewBox="0 0 64 64" className="h-16 w-16" style={{ transform: "rotate(-90deg)" }}>
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeOpacity="0.2"
              className="text-blue-500"
              strokeLinecap="round"
            />
            {/* Progress circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-blue-500"
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.3s ease-in-out, stroke 0.3s",
              }}
            />
          </svg>
          {/* Percentage text overlay */}
          <div className="absolute text-center">
            <p className="text-xs font-bold text-foreground">{percentage}%</p>
          </div>
        </div>

        {/* Metrics - Right side */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            <span className="font-bold">{totalDiscounted.toLocaleString()}</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="text-muted-foreground">{totalProducts.toLocaleString()}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {t("pricing.productsDiscounted") || "products discounted"}
          </p>
        </div>
      </div>
    </Card>
  );
}
