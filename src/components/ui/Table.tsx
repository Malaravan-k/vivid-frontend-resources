import React from 'react';
import { cn } from '../../utils/cn';

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
};

function Table<T extends object>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={cn(
                  "px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="flex justify-center items-center space-x-2">
                  <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce" />
                  <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}                
                onClick={() => onRowClick && onRowClick(row)}
                className={cn("hover:bg-gray-50", onRowClick && "cursor-pointer")}

              >
                {columns.map((column, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-500", column.className)}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : row[column.accessor] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;