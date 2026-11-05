import React from "react";
import { DataTableProps } from "./types";

export default function DataTable<T extends Record<string, any>>({
  columns = [],
  data = [],
  rowKey,
  onRowClick,
  emptyMessage = "No records found.",
  sortBy = null,
  sortDirection = null,
  onSortChange,
}: DataTableProps<T>) {
  const handleHeaderClick = (column: any) => {
    if (!column.sortable || !onSortChange) return;

    const targetSortKey = column.sortKey || column.key;

    // 1. New column clicked -> Set to ASC
    if (sortBy !== targetSortKey) {
      onSortChange(targetSortKey, "asc");
    }
    // 2. Currently ASC -> Switch to DESC
    else if (sortDirection === "asc") {
      onSortChange(targetSortKey, "desc");
    }
    // 3. Currently DESC -> Reset/Unsort
    else if (sortDirection === "desc") {
      onSortChange(null, null);
    }
    // 4. Default fallback -> Set to ASC
    else {
      onSortChange(targetSortKey, "asc");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-[#0F4C81]">
            <tr>
              {columns.map((column: any) => {
                const rawColumnKey = String(column.key);
                const targetSortKey = column.sortKey || column.key;
                const isSortable = Boolean(column.sortable);
                const isSorted = sortBy === targetSortKey;

                return (
                  <th
                    key={rawColumnKey}
                    style={{ width: column.width }}
                    onClick={() => handleHeaderClick(column)}
                    className={`px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                          ? "text-right"
                          : "text-left"
                    } ${
                      isSortable
                        ? "cursor-pointer select-none hover:bg-[#0b3c66]"
                        : ""
                    } ${column.className ?? ""}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        column.align === "center"
                          ? "justify-center"
                          : column.align === "right"
                            ? "justify-end"
                            : "justify-start"
                      }`}
                    >
                      <span>{column.header}</span>

                      {isSortable && (
                        <span className="inline-flex flex-col text-[9px] leading-[9px]">
                          <span
                            className={
                              isSorted && sortDirection === "asc"
                                ? "text-white font-bold opacity-100"
                                : "text-white/40"
                            }
                          >
                            ▲
                          </span>
                          <span
                            className={
                              isSorted && sortDirection === "desc"
                                ? "text-white font-bold opacity-100"
                                : "text-white/40"
                            }
                          >
                            ▼
                          </span>
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={String(row[rowKey])}
                  className={`transition-colors ${
                    index % 2 === 1
                      ? "bg-[#e0eef5]/30 hover:bg-[#e0eef5]/60"
                      : "bg-white hover:bg-[#e0eef5]/60"
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      onClick={
                        column.clickable && onRowClick
                          ? () => onRowClick(row)
                          : undefined
                      }
                      style={{ width: column.width }}
                      className={`px-6 py-4 text-sm text-gray-700 ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                            ? "text-right"
                            : "text-left"
                      } ${column.className ?? ""} ${
                        column.clickable
                          ? "cursor-pointer hover:text-[#0F4C81]"
                          : ""
                      }`}
                    >
                      {column.render
                        ? column.render(row)
                        : (row[column.key as keyof T] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
