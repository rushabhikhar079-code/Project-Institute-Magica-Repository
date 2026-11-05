import { useEffect, useState } from "react";
import { Search, ChevronDown, ChevronRight, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import FilterRenderer from "./FilterRenderer";
import { SearchFilterProps } from "./types";
import { BaseInput } from "../BaseInput";
import { Button } from "../Button";
const SearchFilter = ({
  searchKey,
  searchValue,
  searchPlaceholder = "Search...",

  onSearchChange,
  fields,
  values,
  onValueChange,
  onSearch,
  onClear,
  errors,

  validationSchema,
}: SearchFilterProps) => {
  const location = useLocation();

  const storageKey = `advanced-search-${location.pathname}`;

  const [showAdvanced, setShowAdvanced] = useState(() => {
    return sessionStorage.getItem(storageKey) === "true";
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    setShowAdvanced(sessionStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  const toggleAdvanced = () => {
    const next = !showAdvanced;

    setShowAdvanced(next);
    sessionStorage.setItem(storageKey, String(next));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validationSchema) {
      const result = validationSchema.safeParse(values);

      if (!result.success) {
        const newErrors: Record<string, string> = {};

        result.error.issues.forEach((issue) => {
          const field = issue.path.join(".");

          if (!newErrors[field]) {
            newErrors[field] = issue.message;
          }
        });

        setValidationErrors(newErrors);
        return;
      }
      setValidationErrors({});
    }

    onSearch();
  };
  const searchError = searchKey ? errors?.[searchKey] : undefined;
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl p-4 mb-6"
    >
      {/* Search */}
      <div className="mb-4">
        {/* 1. Dedicated relative wrapper for input + icon ONLY */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <BaseInput
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            error={searchError}
            className="pl-10"
          ></BaseInput>
          {/* <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              searchError
                ? "border-red-500 focus:ring-red-200 focus:border-red-500" // 🔴 Red border & subtle red glow when active
                : "border-gray-300 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]" // 🔵 Normal blue ring when active
            }`}
          /> */}
        </div>
      </div>

      {fields.length > 0 && (
        <>
          <button
            type="button"
            onClick={toggleAdvanced}
            className="flex items-center gap-2 text-[#0F4C81] text-sm font-medium hover:underline"
          >
            {showAdvanced ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Advanced Search
          </button>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fields.map((field) => {
                  // Spacer
                  if (field.type === "spacer") {
                    return <div key={field.key} className="hidden md:block" />;
                  }

                  // Don't render a field separately if another field
                  // has declared it through renderWith.
                  const isRenderedInsideAnotherField = fields.some(
                    (parentField) => parentField.renderWith === field.key,
                  );

                  if (isRenderedInsideAnotherField) {
                    return null;
                  }

                  // Find the field that should be rendered inside this field
                  const inlineField = field.renderWith
                    ? fields.find((item) => item.key === field.renderWith)
                    : undefined;

                  return (
                    <div
                      key={field.key}
                      className={`${field.wrapperClassName ?? ""} ${
                        inlineField ? "relative" : ""
                      }`}
                    >
                      {inlineField && (
                        <div className="absolute right-0 top-0 z-20">
                          <FilterRenderer
                            field={inlineField}
                            value={values[inlineField.key]}
                            onChange={(value) => {
                              onValueChange(inlineField.key, value);
                            }}
                            error={
                              validationErrors[inlineField.key] ||
                              errors?.[inlineField.key]
                            }
                            hideLabel
                          />
                        </div>
                      )}

                      <FilterRenderer
                        field={field}
                        value={values[field.key]}
                        onChange={(value) => onValueChange(field.key, value)}
                        error={
                          validationErrors[field.key] || errors?.[field.key]
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
            <Button preset="search" />
            <Button preset="clear" onClick={onClear} />
          </div>
        </>
      )}
    </form>
  );
};

export default SearchFilter;
