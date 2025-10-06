// Core table system
export { DataTable } from "./core/DataTable";
export { useTableState } from "./core/hooks";
export type { 
  DataTableProps, 
  BaseTableConfig, 
  DomainTableProps,
  CellProps,
  HeaderProps,
  BodyProps,
  PaginationProps,
  SearchProps,
  ToolbarProps,
  SelectionCheckboxProps,
  SortableHeaderProps
} from "./core/types";

// Reusable components
export { SelectionCell, SortableHeaderCell } from "./components/cells";
export { Pagination, Search, Toolbar } from "./components/features";

// Domain-specific tables
export { CompetitorTable, type Competitor } from "./domains/competitors";

// Utilities
export { Icon, iconMapping, type IconName } from "./utils";
