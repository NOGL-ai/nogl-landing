import "@tanstack/react-table";

/**
 * Augment TanStack Table's ColumnMeta to carry alignment hints.
 * Used in ProductTypesTable to drive th/td text-align classes.
 */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
    /** Used by ProductDataTable to mark the row-header column */
    isRowHeader?: boolean;
  }
}
