"use client";

import React, { useCallback, useState } from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "../../utils/Icon";
import { SearchProps } from "../../core/types";

// Simple debounce implementation to avoid lodash dependency
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Global filter function that searches across all fields
const globalFilterFn = (row: any, _columnId: string, value: string) => {
  const search = value.toLowerCase();
  return Object.values(row.original).some((cell: unknown) => {
    if (typeof cell === "string") {
      return cell.toLowerCase().includes(search);
    }
    if (typeof cell === "object" && cell !== null) {
      return Object.values(cell).some(
        (nestedValue: unknown) =>
          typeof nestedValue === "string" &&
          nestedValue.toLowerCase().includes(search)
      );
    }
    return false;
  });
};

export function Search<TData>({
  table,
  placeholder = "Search all fields...",
  debounceMs = 300,
}: SearchProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSetGlobalFilter = useCallback(
    debounce((value: string) => {
      setGlobalFilter(value);
      setIsSearching(false);
    }, debounceMs),
    [debounceMs]
  );

  const handleSearchChange = (value: string) => {
    setIsSearching(true);
    debouncedSetGlobalFilter(value);
    table.setGlobalFilter(value);
  };

  const clearSearch = () => {
    setGlobalFilter("");
    setIsSearching(false);
    table.setGlobalFilter("");
  };

  const isFiltered = globalFilter.length > 0;

  return (
    <div className="relative w-full max-w-sm">
      <Icon 
        name="Search" 
        className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform transition-colors ${
          isFiltered
            ? "text-blue-500 dark:text-blue-400"
            : "text-gray-400 dark:text-gray-500"
        }`}
        aria-hidden={true}
      />
      <Input
        placeholder={placeholder}
        value={globalFilter}
        onChange={(e) => handleSearchChange(e.target.value)}
        className={`w-full border-gray-300 bg-white pl-10 pr-10 text-gray-900 placeholder-gray-500 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 ${
          isFiltered
            ? "border-blue-300 focus:border-blue-500 dark:border-blue-500 dark:focus:border-blue-400"
            : ""
        }`}
        aria-label="Search all table fields"
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        </div>
      )}
      {isFiltered && !isSearching && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Clear search"
        >
          <Icon name="X" className="h-3 w-3" aria-hidden={true} />
        </Button>
      )}
    </div>
  );
}
