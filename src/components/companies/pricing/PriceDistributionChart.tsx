"use client";

import { useTranslations } from "next-intl";
import { Download, ExternalLink, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";

import { Card } from "@/components/ui/card";
import type { PriceDistributionBucket } from "@/types/company";

interface PriceDistributionChartProps {
  buckets: PriceDistributionBucket[];
  companyId?: string;
  slug: string;
  dateRange?: {
    start: string;
    end: string;
  };
  loading?: boolean;
}

export function PriceDistributionChart({
  buckets,
  companyId,
  slug,
  dateRange,
  loading = false,
}: PriceDistributionChartProps) {
  const t = useTranslations("companies");
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<ApexCharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || loading || buckets.length === 0) return;

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: "bar",
        height: 290,
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: false,
        },
        zoom: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "75%",
          borderRadius: 4,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 0,
        colors: ["transparent"],
      },
      tooltip: {
        theme: "light",
        y: {
          formatter(val) {
            return `${val}%`;
          },
        },
      },
      xaxis: {
        categories: buckets.map((b) => `€${b.range.replace(/-/g, "–")}`),
        axisBorder: {
          show: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        axisTicks: {
          show: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: "rgb(115, 115, 115)",
          },
        },
      },
      yaxis: {
        title: {
          text: "% of Products",
          style: {
            fontSize: "12px",
            color: "rgb(115, 115, 115)",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: "rgb(115, 115, 115)",
          },
          formatter(val) {
            return `${Math.round(val)}%`;
          },
        },
      },
      fill: {
        opacity: 1,
        colors: ["rgb(59, 130, 246)"],
      },
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          filter: {
            type: "none",
          },
        },
      },
      grid: {
        borderColor: "rgba(0, 0, 0, 0.1)",
        strokeDashArray: 4,
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "80%",
              },
            },
          },
        },
      ],
    };

    const series = [
      {
        name: "% of Products",
        data: buckets.map((b) => b.percentage),
      },
    ];

    if (chart) {
      chart.destroy();
    }

    const newChart = new ApexCharts(chartRef.current, {
      ...options,
      series,
    });

    newChart.render();
    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [buckets, loading]);

  const handleDownloadAsImage = async () => {
    if (!chart) return;
    try {
      const svg = await chart.dataURI();
      const link = document.createElement("a");
      link.href = svg.imgURI;
      link.download = `price-distribution-${slug}-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download chart", error);
    }
  };

  const pivotTableUrl = companyId
    ? `https://app.particl.com/dashboard/companies/${companyId}/pivot?row_field=color&column_field=price_bucket&filters=%5B%5D&companyId=%22${companyId}%22`
    : undefined;

  const handleConfigClick = () => {
    // Future implementation for config modal
    console.log("Config clicked");
  };

  return (
    <Card className="flex flex-col overflow-hidden border border-border p-0">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("pricing.priceDistribution") || "Price Distribution"}
          </h2>
          <div
            className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            title="Current listed product prices bucketed into groups."
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAsImage}
            className="flex items-center justify-center rounded border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Download as Image"
            aria-label="Download as Image"
          >
            <Download className="h-4 w-4" />
          </button>

          {pivotTableUrl && (
            <a
              href={pivotTableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Open in Pivot Table"
              aria-label="Open in Pivot Table"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <button
            onClick={handleConfigClick}
            className="inline-flex items-center gap-2 rounded border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label="Config"
          >
            <Settings className="h-4 w-4" />
            Config
          </button>
        </div>
      </div>

      {/* Filter Summary (optional) */}
      {dateRange && (
        <div className="border-b border-border bg-muted/50 px-5 py-3">
          <p className="text-sm text-foreground">
            All <span className="font-semibold">products</span> between {dateRange.start} and{" "}
            {dateRange.end}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-5 py-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l3 0M12 3l0 3M7.8 7.8l-2.2 -2.2M16.2 7.8l2.2 -2.2M7.8 16.2l-2.2 2.2M12 12l9 3l-4 2l-2 4l-3 -9"
          />
        </svg>
        <p className="text-sm text-muted-foreground">
          {t("pricing.clickPriceFilter") || "Click a price bucket to apply price filters"}
        </p>
      </div>

      {/* Chart Section */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Legend/Labels */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Price Buckets
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-sm font-medium text-foreground">% of Product Prices</span>
            <div
              className="flex items-center justify-center gap-1 rounded p-1 text-muted-foreground"
              title="Showing the 5th to 95th percentile of products for a clearer, easy to visualize distribution"
            >
              <span className="text-xs font-medium text-muted-foreground">P 5 -P 95</span>
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div
          ref={chartRef}
          className={`min-h-[290px] w-full rounded-lg border border-muted bg-white ${loading ? "animate-pulse" : ""}`}
        >
          {loading && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer (optional) */}
      {buckets.length === 0 && !loading && (
        <div className="border-t border-border px-5 py-4 text-center text-sm text-muted-foreground">
          No price distribution data available
        </div>
      )}
    </Card>
  );
}
