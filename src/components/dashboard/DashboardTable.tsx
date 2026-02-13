import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DashboardTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => React.ReactNode;
}

export default function DashboardTable<T extends { id: string }>({ data, columns, actions }: DashboardTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/50 shadow-xl bg-white/80 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-gray-800/50 border-b-2 border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
            {data.length === 0 ? (
              <tr>
                 <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium">No data available</p>
                    </div>
                 </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 dark:hover:from-gray-700/30 dark:hover:to-gray-700/30 transition-all duration-200 group"
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
