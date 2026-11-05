// import { ReactNode } from "react";

// export interface TableColumn<T extends Record<string, any>> {
//   /**
//    * Unique column key
//    */
//   key: keyof T | string;

//   /**
//    * Header text
//    */
//   header: string | React.ReactNode;
//   /**
//    * Optional custom renderer
//    * If omitted, DataTable will render row[key]
//    */
//   render?: (row: T) => ReactNode;

//   /**
//    * Header alignment
//    */
//   align?: "left" | "center" | "right";

//   /**
//    * Custom class for header/cells
//    */
//   className?: string;
//   width?: string;
//   /**
//    * Makes only this column clickable
//    */
//   clickable?: boolean;
// }

// export interface PaginationConfig {
//   enabled: boolean;
//   currentPage: number;
//   pageSize: number;
//   totalItems: number;

//   onPageChange: (page: number) => void;
//   onPageSizeChange: (size: number) => void;
// }

// export interface DataTableProps<T extends Record<string, any>> {
//   columns: TableColumn<T>[];

//   data: T[];

//   /**
//    * Unique field in the row
//    */
//   rowKey: keyof T;

//   /**
//    * Row click handler
//    */
//   onRowClick?: (row: T) => void;

//   /**
//    * Empty state text
//    */
//   emptyMessage?: string;

//   /**
//    * Optional pagination
//    */
//   pagination?: PaginationConfig;
// }
import { ReactNode } from "react";

export interface TableColumn<T extends Record<string, any>> {
  /**
   * Unique column key
   */
  key: keyof T | string;

  /**
   * Header text
   */
  header: string | React.ReactNode;
  /**
   * Optional custom renderer
   * If omitted, DataTable will render row[key]
   */
  render?: (row: T) => ReactNode;

  /**
   * Header alignment
   */
  align?: "left" | "center" | "right";

  /**
   * Custom class for header/cells
   */
  className?: string;
  width?: string;
  /**
   * Makes only this column clickable
   */
  clickable?: boolean;
  sortable?: boolean;
  sortKey?: string;
}

export interface PaginationConfig {
  enabled: boolean;
  currentPage: number;
  pageSize: number;
  totalItems: number;

  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface DataTableProps<T extends Record<string, any>> {
  columns: TableColumn<T>[];

  data: T[];

  /**
   * Unique field in the row
   */
  rowKey: keyof T;

  /**
   * Row click handler
   */
  onRowClick?: (row: T) => void;

  /**
   * Empty state text
   */
  emptyMessage?: string;

  /**
   * Optional pagination
   */
  pagination?: PaginationConfig;

  //Server-side sorting props
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
  onSortChange?: (
    sortKey: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => void;
}
