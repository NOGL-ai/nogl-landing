import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { ColumnDef } from '@tanstack/react-table';

// Mock data
interface TestData {
  id: string;
  name: string;
  value: number;
}

const testData: TestData[] = [
  { id: '1', name: 'Item 1', value: 100 },
  { id: '2', name: 'Item 2', value: 200 },
  { id: '3', name: 'Item 3', value: 300 },
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
];

describe('DataTable Column Resizing', () => {
  it('should render table with column resizing enabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnResizing={true}
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
  });

  it('should show resize handles when column resizing is enabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnResizing={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Check if resize handles are present
    const resizeHandles = screen.getAllByLabelText(/Resize column/);
    expect(resizeHandles).toHaveLength(2); // One for each column
  });

  it('should not show resize handles when column resizing is disabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnResizing={false}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Check if resize handles are not present
    const resizeHandles = screen.queryAllByLabelText(/Resize column/);
    expect(resizeHandles).toHaveLength(0);
  });

  it('should apply column widths when resizing is enabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnResizing={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    // Check if column headers have width styles
    const nameHeader = screen.getByText('Name').closest('th');
    const valueHeader = screen.getByText('Value').closest('th');
    
    expect(nameHeader).toHaveStyle('width: 200px');
    expect(valueHeader).toHaveStyle('width: 150px');
  });

  it('should handle mouse down events on resize handles', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnResizing={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    const resizeHandle = screen.getByLabelText('Resize column Name');
    
    // Simulate mouse down event
    fireEvent.mouseDown(resizeHandle);
    
    // The resize handle should be present and clickable
    expect(resizeHandle).toBeInTheDocument();
    expect(resizeHandle).toHaveClass('cursor-col-resize');
  });

  it('should handle touch start events on resize handles', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnResizing={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    const resizeHandle = screen.getByLabelText('Resize column Name');
    
    // Simulate touch start event
    fireEvent.touchStart(resizeHandle);
    
    // The resize handle should be present and touchable
    expect(resizeHandle).toBeInTheDocument();
    expect(resizeHandle).toHaveClass('touch-none');
  });

  it('should have proper accessibility attributes for resize handles', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enableColumnResizing={true}
        enablePagination={false}
        enableSorting={false}
        enableFiltering={false}
        enableSelection={false}
      />
    );

    const resizeHandles = screen.getAllByLabelText(/Resize column/);
    
    resizeHandles.forEach((handle) => {
      expect(handle).toHaveAttribute('aria-label');
      expect(handle).toHaveClass('select-none');
      expect(handle).toHaveClass('touch-none');
    });
  });
});
