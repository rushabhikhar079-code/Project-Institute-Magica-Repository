// src/components/common/SearchFilter/FilterRenderer.tsx

import { FilterField } from "./types";
import { BaseInput } from "../BaseInput";
import { Dropdown } from "../Select";
import { CustomDatePicker } from "../CustomDatePicker";

interface FilterRendererProps {
  field: FilterField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  hideLabel?: boolean;
}

const FilterRenderer = ({
  field,
  value,
  onChange,
  error,
  hideLabel = false,
}: FilterRendererProps) => {
  switch (field.type) {
    case "text":
    case "email":
    case "number":
      return (
        <div>
          <BaseInput
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            error={error}
          />
        </div>
      );

    case "date":
      return (
        <div className="w-full">
          <CustomDatePicker
            name={field.key}
            label={field.label}
            value={value ?? ""}
            onChange={(value) => onChange(value)}
          />

          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      );

    case "select":
      return (
        <Dropdown
          label={field.label}
          options={field.options ?? []}
          value={value ?? ""}
          disabled={field.disabled}
          onChange={onChange}
        />
      );

    case "radio":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>

          <div className="flex items-center gap-6 mt-2">
            {field.options?.map((option) => (
              <label
                key={String(option.value)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.key}
                  value={String(option.value)}
                  checked={Number(value) === Number(option.value)}
                  disabled={field.disabled}
                  onChange={() => onChange(option.value)}
                  className="w-4 h-4 accent-[#0F4C81] disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "checkbox":
      return (
        <div>
          {!hideLabel && field.label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
          )}

          <div className="flex gap-4 flex-wrap">
            {field.options?.map((option) => {
              const isBooleanOption = typeof option.value === "boolean";

              const checked = isBooleanOption
                ? Boolean(value) === option.value
                : Array.isArray(value) &&
                  value.some((v: any) => String(v) === String(option.value));

              return (
                <label
                  key={String(option.value)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={field.disabled}
                    onChange={(e) => {
                      if (isBooleanOption) {
                        onChange(e.target.checked);
                        return;
                      }

                      const currentValues = Array.isArray(value) ? value : [];

                      if (e.target.checked) {
                        onChange([...currentValues, option.value]);
                      } else {
                        onChange(
                          currentValues.filter(
                            (v: any) => String(v) !== String(option.value),
                          ),
                        );
                      }
                    }}
                    className="w-4 h-4 accent-[#0F4C81]"
                  />

                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default FilterRenderer;
