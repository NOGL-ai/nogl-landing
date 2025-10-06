"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "../../utils/Icon";
import { ToolbarProps } from "../../core/types";

export function Toolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search...",
}: ToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Icon 
            name="Search" 
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" 
            aria-hidden={true}
          />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey || "")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey || "")?.setFilterValue(event.target.value)
            }
            className="pl-10"
            aria-label={`Search ${searchKey || "data"}`}
          />
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
            aria-label="Clear all filters"
          >
            Reset
            <Icon name="FilterX" className="ml-2 h-4 w-4" aria-hidden={true} />
          </Button>
        )}
      </div>
    </div>
  );
}
