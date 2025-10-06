"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../core/DataTable";
import { CompetitorTableColumns } from "./columns/CompetitorTableColumns";
import { DomainTableProps } from "../../core/types";

// Competitor data interface
export interface Competitor {
  id: number;
  name: string;
  domain: string;
  avatar: string;
  products: number;
  position: number;
  trend: number;
  trendUp: boolean;
  date: string;
  categories: string[];
  competitorPrice: number;
  myPrice: number;
}

interface CompetitorTableProps extends Omit<DomainTableProps<Competitor, any>, 'columns'> {
  competitors: Competitor[];
}

export function CompetitorTable({
  competitors,
  enableInfiniteScroll = false,
  onInfiniteScrollToggle,
  infiniteScrollProps,
  variant = "default",
  tableTitle,
  tableBadge,
  tableDescription,
  ...tableProps
}: CompetitorTableProps) {
  const columns = React.useMemo(() => 
    CompetitorTableColumns(competitors, { variant }), 
    [competitors, variant]
  );

  return (
    <div 
      className="space-y-4"
      role="region"
      aria-label="Competitor monitoring table with pricing information"
    >
      <DataTable
        columns={columns}
        data={competitors}
        searchKey="name"
        searchPlaceholder="Search competitors by name or domain..."
        enablePagination={true}
        enableSorting={true}
        enableFiltering={true}
        enableSelection={true}
        enableGlobalSearch={true}
        enableColumnManagement={true}
        enableColumnResizing={true}
        enableColumnReordering={true}
        pageSize={20}
        variant={variant}
        tableTitle={tableTitle}
        tableBadge={tableBadge}
        tableDescription={tableDescription}
        {...tableProps}
      />
    </div>
  );
}
