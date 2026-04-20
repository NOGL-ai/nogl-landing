// Lightweight mock for react-aria-components in Jest tests.
// Replaces complex ARIA-managed components with plain HTML equivalents
// so that role queries work predictably in jsdom.
import React from "react";

// Helper to resolve render-prop or direct children
const resolveChildren = (children: any, state: any = {}) =>
  typeof children === "function" ? children(state) : children;

// Helper to resolve className render prop
const resolveClassName = (className: any, state: any = {}) =>
  typeof className === "function" ? className(state) : className;

export const Table = ({ children, role, className, ...props }: any) => (
  <table
    role={role || "table"}
    className={resolveClassName(className)}
    {...props}
  >
    {children}
  </table>
);

export const TableHeader = ({ children, columns, className, ...props }: any) => (
  <thead className={resolveClassName(className)} {...props}>{children}</thead>
);

export const TableBody = ({ children, items, renderEmptyState, ...props }: any) => (
  <tbody {...props}>{children}</tbody>
);

const columnState = {
  allowsSorting: false,
  sortDirection: undefined,
  isFocused: false,
  isHovered: false,
  isPressed: false,
  isFocusVisible: false,
};

export const Column = ({ children, className, role: _role, ...props }: any) => (
  <th
    className={resolveClassName(className, columnState)}
    {...props}
    role="columnheader"
  >
    {resolveChildren(children, columnState)}
  </th>
);

const rowState = {
  isSelected: false,
  isFocused: false,
  isHovered: false,
  isPressed: false,
  isFocusVisible: false,
  isDisabled: false,
  selectionMode: "none",
  selectionBehavior: "toggle",
  allowsSelection: false,
};

export const Row = ({ children, className, role: _role, ...props }: any) => (
  <tr className={resolveClassName(className, rowState)} {...props} role="row">
    {resolveChildren(children, rowState)}
  </tr>
);

export const Cell = ({ children, className, ...props }: any) => (
  <td role="gridcell" className={resolveClassName(className)} {...props}>
    {children}
  </td>
);

export const Collection = ({ children, items }: any) => <>{children}</>;

export const Group = ({ children, className, ...props }: any) => (
  <div className={resolveClassName(className)} {...props}>
    {children}
  </div>
);

export const useTableOptions = () => ({
  selectionBehavior: null,
  selectionMode: "none",
});

// Additional exports that may be needed
export const AriaTable = Table;
export const AriaTableBody = TableBody;
export const AriaTableHeader = TableHeader;
export const AriaColumn = Column;
export const AriaRow = Row;
export const AriaCell = Cell;
export const AriaGroup = Group;
export const AriaCollection = Collection;
