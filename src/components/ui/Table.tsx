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
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={cn(
                  "px-6 py-3.5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider",
                  "first:rounded-tl-lg last:rounded-tr-lg",
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
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" />
                    <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <p className="text-sm text-gray-500">Loading data...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-700">No data available</p>
                  <p className="text-xs text-gray-500">Try adjusting your search or filter</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}                
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "transition-colors duration-150",
                  onRowClick ? "cursor-pointer hover:bg-blue-50" : "hover:bg-gray-50"
                )}
              >
                {columns.map((column, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      "px-6 py-4 text-sm",
                      "first:rounded-bl-lg last:rounded-br-lg",
                      typeof column.accessor === 'string' ? "text-gray-700" : "text-gray-600",
                      column.className
                    )}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : row[column.accessor] as React.ReactNode }
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