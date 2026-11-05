import type { ReactNode } from "react";

// Stub for the existing project's TableColumn type.
// The payment columns file imports `TableColumn` from this path.
// This provides the same interface so the type resolves correctly.

export interface TableColumn<T extends Record<string, any>> {
  key: keyof T | string;
  header: string | React.ReactNode;
  render?: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  width?: string;
  clickable?: boolean;
  sortable?: boolean;
  sortKey?: string;
}
