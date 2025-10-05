import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { ColumnDef } from '@tanstack/react-table';

// Mock data
interface TestData {
  id: string;
  name: string;
  value: number;
  category: string;
}

const testData: TestData[] = [
  { id: '1', name: 'Item 1', value: 100, category: 'A' },
  { id: '2', name: 'Item 2', value: 200, category: 'B' },
  { id: '3', name: 'Item 3', value: 300, category: 'A' },
];

const testColumns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
  },
  {
    accessorKey: 'value',
    header: 'Value',
    size: 150,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    size: 100,
  },
];

describe('DataTable Column Reordering', () => {
  it('should render table with column reordering enabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Check if table is rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Check if column headers are rendered
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('should show drag handles when column reordering is enabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Check if drag handles are present
    const dragHandles = screen.getAllByLabelText(/Drag to reorder column/);
    expect(dragHandles).toHaveLength(3); // One for each column
  });

  it('should not show drag handles when column reordering is disabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={false}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Check if drag handles are not present
    const dragHandles = screen.queryAllByLabelText(/Drag to reorder column/);
    expect(dragHandles).toHaveLength(0);
  });

  it('should have proper accessibility attributes for drag handles', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    const dragHandles = screen.getAllByLabelText(/Drag to reorder column/);
    
    dragHandles.forEach((handle) => {
      expect(handle).toHaveAttribute('aria-label');
      expect(handle).toHaveClass('cursor-grab');
    });
  });

  it('should have grab cursor on column headers when reordering is enabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Check if column headers have grab cursor
    const columnHeaders = screen.getAllByRole('columnheader');
    columnHeaders.forEach((header) => {
      expect(header).toHaveClass('cursor-grab');
    });
  });

  it('should not have grab cursor when reordering is disabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={false}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Check if column headers don't have grab cursor
    const columnHeaders = screen.getAllByRole('columnheader');
    columnHeaders.forEach((header) => {
      expect(header).not.toHaveClass('cursor-grab');
    });
  });

  it('should maintain column order state', () => {
    const { rerender } = render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Initial order should be Name, Value, Category
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders[0]).toHaveTextContent('Name');
    expect(columnHeaders[1]).toHaveTextContent('Value');
    expect(columnHeaders[2]).toHaveTextContent('Category');

    // Re-render with same props should maintain order
    rerender(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    const rerenderedHeaders = screen.getAllByRole('columnheader');
    expect(rerenderedHeaders[0]).toHaveTextContent('Name');
    expect(rerenderedHeaders[1]).toHaveTextContent('Value');
    expect(rerenderedHeaders[2]).toHaveTextContent('Category');
  });

  it('should work with both column resizing and reordering enabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnReordering={true}
        enableColumnResizing={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Should have both drag handles and resize handles
    const dragHandles = screen.getAllByLabelText(/Drag to reorder column/);
    const resizeHandles = screen.getAllByLabelText(/Resize column/);
    
    expect(dragHandles).toHaveLength(3);
    expect(resizeHandles).toHaveLength(3);
  });
});
