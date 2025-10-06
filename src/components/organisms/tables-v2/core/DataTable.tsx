"use client";

import React from "react";
import { flexRender } from "@tanstack/react-table";
import { Table as UntitledTable, TableCard } from "@/components/application/table/table";
import { DotsVertical } from "@untitledui/icons";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { useTableState } from "./hooks";
import { DataTableProps } from "./types";
import { SortableHeaderCell } from "../components/cells";
import { Pagination, Search, Toolbar } from "../components/features";

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  enableSelection = false,
  enableGlobalSearch = false,
  enableColumnManagement = false,
  enableColumnResizing = false,
  enableColumnReordering = false,
  pageSize = 10,
  className,
  onRowSelectionChange,
  variant = "default",
  tableTitle,
  tableBadge,
  tableDescription,
}: DataTableProps<TData, TValue>) {
  const { table } = useTableState({
    columns,
    data,
    searchKey,
    searchPlaceholder,
    enablePagination,
    enableSorting,
    enableFiltering,
    enableSelection,
    enableGlobalSearch,
    enableColumnManagement,
    enableColumnResizing,
    enableColumnReordering,
    pageSize,
    onRowSelectionChange,
  });

  if (variant === "untitled-ui") {
    return (
      <TableCard.Root size="md" className={className}>
        {tableTitle && (
          <TableCard.Header
            title={tableTitle}
            badge={tableBadge}
            description={tableDescription}
            contentTrailing={
              <Dropdown.Root>
                <Dropdown.DotsButton />
                <Dropdown.Popover className="w-min">
                  <Dropdown.Menu>
                    <Dropdown.Item>Export</Dropdown.Item>
                    <Dropdown.Item>Print</Dropdown.Item>
                    <Dropdown.Item>Settings</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown.Root>
            }
          />
        )}
        <UntitledTable
          role="table"
          aria-label={tableTitle || "Data table"}
          aria-rowcount={table.getRowModel().rows.length + 1}
          aria-colcount={table.getAllColumns().length}
          size="md"
        >
          {/* Header */}
          <UntitledTable.Header aria-label="Table header with column headers">
            {table.getHeaderGroups().map((headerGroup) => (
              <UntitledTable.Row 
                key={headerGroup.id}
                role="row"
                aria-rowindex={1}
              >
                {headerGroup.headers.map((header, index) => (
                  <SortableHeaderCell
                    key={header.id}
                    header={header}
                    index={index}
                    enableColumnResizing={enableColumnResizing}
                    enableColumnReordering={enableColumnReordering}
                    variant={variant}
                  />
                ))}
              </UntitledTable.Row>
            ))}
          </UntitledTable.Header>

          {/* Body */}
          <UntitledTable.Body
            aria-live="polite"
            aria-label="Table body with data rows"
          >
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const isAlternate = index % 2 === 0;
                const rowBg = variant === "untitled-ui"
                  ? (isAlternate ? "bg-[#FDFDFD]" : "bg-white")
                  : row.getIsSelected() ? "bg-blue-50 dark:bg-blue-900/20" : "";

                return (
                  <UntitledTable.Row
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    role="row"
                    aria-rowindex={index + 2} // +2 because header is row 1
                    aria-selected={row.getIsSelected()}
                    className={rowBg}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <UntitledTable.Cell
                        key={cell.id}
                        role="gridcell"
                        aria-colindex={cellIndex + 1}
                        aria-describedby={cell.column.id}
                        style={{
                          width: enableColumnResizing ? cell.column.getSize() : undefined,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </UntitledTable.Cell>
                    ))}
                  </UntitledTable.Row>
                );
              })
            ) : (
              <UntitledTable.Row role="row">
                <UntitledTable.Cell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center text-gray-500 dark:text-gray-400"
                  role="gridcell"
                  aria-colspan={table.getAllColumns().length}
                >
                  <div role="status" aria-live="polite">
                    No results found.
                  </div>
                </UntitledTable.Cell>
              </UntitledTable.Row>
            )}
          </UntitledTable.Body>
        </UntitledTable>
        {enablePagination && <Pagination table={table} variant={variant} />}
      </TableCard.Root>
    );
  }

  return (
    <div
      className={`space-y-4 ${className || ""}`}
      role="region"
      aria-label="Data table with sortable columns and pagination"
    >
      {enableFiltering && !enableGlobalSearch && (
        <Toolbar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
        />
      )}
      {enableGlobalSearch && (
        <Search
          table={table}
          placeholder={searchPlaceholder}
        />
      )}
      <UntitledTable
        role="table"
        aria-label="Data table"
        aria-rowcount={table.getRowModel().rows.length + 1}
        aria-colcount={table.getAllColumns().length}
      >
        {/* Header */}
        <UntitledTable.Header aria-label="Table header with column headers">
          {table.getHeaderGroups().map((headerGroup) => (
            <UntitledTable.Row 
              key={headerGroup.id}
              role="row"
              aria-rowindex={1}
            >
              {headerGroup.headers.map((header, index) => (
                <SortableHeaderCell
                  key={header.id}
                  header={header}
                  index={index}
                  enableColumnResizing={enableColumnResizing}
                  enableColumnReordering={enableColumnReordering}
                  variant={variant}
                />
              ))}
            </UntitledTable.Row>
          ))}
        </UntitledTable.Header>

        {/* Body */}
        <UntitledTable.Body
          aria-live="polite"
          aria-label="Table body with data rows"
        >
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row, index) => {
              const isAlternate = index % 2 === 0;
              const rowBg = variant === "untitled-ui"
                ? (isAlternate ? "bg-[#FDFDFD]" : "bg-white")
                : row.getIsSelected() ? "bg-blue-50 dark:bg-blue-900/20" : "";

              return (
                <UntitledTable.Row
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  role="row"
                  aria-rowindex={index + 2} // +2 because header is row 1
                  aria-selected={row.getIsSelected()}
                  className={rowBg}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <UntitledTable.Cell
                      key={cell.id}
                      role="gridcell"
                      aria-colindex={cellIndex + 1}
                      aria-describedby={cell.column.id}
                      style={{
                        width: enableColumnResizing ? cell.column.getSize() : undefined,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </UntitledTable.Cell>
                  ))}
                </UntitledTable.Row>
              );
            })
          ) : (
            <UntitledTable.Row role="row">
              <UntitledTable.Cell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center text-gray-500 dark:text-gray-400"
                role="gridcell"
                aria-colspan={table.getAllColumns().length}
              >
                <div role="status" aria-live="polite">
                  No results found.
                </div>
              </UntitledTable.Cell>
            </UntitledTable.Row>
          )}
        </UntitledTable.Body>
      </UntitledTable>
      {enablePagination && <Pagination table={table} variant={variant} />}
    </div>
  );
}
