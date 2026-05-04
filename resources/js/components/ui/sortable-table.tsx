import * as React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface SortableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortConfig?: SortConfig;
  onSort?: (sortConfig: SortConfig) => void;
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function SortableTable<T>({
  data,
  columns,
  sortConfig,
  onSort,
  className,
  emptyMessage = 'No data available',
  isLoading = false,
}: SortableTableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (!onSort) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    onSort({ key: key as string, direction });
  };

  const getSortIcon = (columnKey: keyof T) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }

    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)}>
        <thead className="[&_tr]:border-b">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                className={cn(
                  'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                  column.sortable && 'cursor-pointer hover:bg-muted/50 transition-colors',
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <span className="inline-flex">
                      {getSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((item, index) => (
            <tr
              key={index}
              className="border-b transition-colors hover:bg-muted/50"
            >
              {columns.map((column) => (
                <td
                  key={column.key as string}
                  className={cn('p-4 align-middle', column.className)}
                >
                  {column.render 
                    ? column.render(item[column.key], item)
                    : String(item[column.key] ?? '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
