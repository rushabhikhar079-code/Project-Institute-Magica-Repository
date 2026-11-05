import { z } from "zod";

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export type FilterType =
  | "text"
  | "email"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "number"
  | "spacer";

export interface FilterField {
  key: string;
  label: string;
  type: FilterType;

  placeholder?: string;

  options?: FilterOption[];

  disabled?: boolean;
  renderWith?: string;
  className?: string;
  wrapperClassName?: string;
}

export interface SearchFilterProps {
  searchKey?: string;
  searchValue: string;

  searchPlaceholder?: string;

  onSearchChange: (value: string) => void;

  fields: FilterField[];

  values: Record<string, any>;

  errors?: Record<string, string>;
  validationSchema?: z.ZodType;

  onValueChange: (key: string, value: any) => void;

  onSearch: () => void;

  onClear: () => void;
}
