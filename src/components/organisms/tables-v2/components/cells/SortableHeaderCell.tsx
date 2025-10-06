"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, Header } from "@tanstack/react-table";
import { Table as UntitledTable } from "@/components/application/table/table";
import { Icon } from "../../utils/Icon";

interface SortableHeaderCellProps<TData> {
  header: Header<TData, unknown>;
  index: number;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  variant?: "default" | "untitled-ui";
}

export function SortableHeaderCell<TData>({
  header,
  index,
  enableColumnResizing = false,
  enableColumnReordering = false,
  variant = "default",
}: SortableHeaderCellProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.id,
    disabled: !enableColumnReordering,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSortable = header.column.getCanSort();
  const sortDirection = header.column.getIsSorted();

  return (
    <UntitledTable.Head
      style={{
        ...style,
        width: enableColumnResizing ? header.getSize() : undefined,
      }}
      aria-colindex={index + 1}
      aria-sort={
        isSortable
          ? sortDirection === "asc"
            ? "ascending"
            : sortDirection === "desc"
            ? "descending"
            : "none"
          : undefined
      }
      aria-label={`Column ${index + 1}: ${header.id}`}
      className={`relative ${isDragging ? "z-50" : ""} ${
        enableColumnReordering ? "cursor-grab active:cursor-grabbing" : ""
      } ${variant === "untitled-ui" ? "px-6 py-2 text-xs font-semibold text-tertiary" : ""}`}
      {...attributes}
      {...listeners}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}

      {/* Column Resize Handle */}
      {enableColumnResizing && header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className="absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize select-none touch-none hover:bg-blue-500 dark:bg-gray-600 dark:hover:bg-blue-400"
          aria-label={`Resize column ${header.id}`}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Drag Handle for Reordering */}
      {enableColumnReordering && (
        <div
          className="absolute left-0 top-0 h-full w-2 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
          aria-label={`Drag to reorder column ${header.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Icon
            name="MoreHorizontal"
            className="h-3 w-3 text-gray-400 dark:text-gray-500"
            aria-hidden={true}
          />
        </div>
      )}
    </UntitledTable.Head>
  );
}
