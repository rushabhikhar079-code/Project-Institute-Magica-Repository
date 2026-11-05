import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  required?: boolean;
  maxDate?: string;
}

// Format incoming YYYY-MM-DD or ISO string to DD/MM/YYYY
const formatToDDMMYYYY = (val: any): string => {
  if (!val) return "";

  const cleanVal = String(val).trim().split("T")[0].split(" ")[0];
  const parts = cleanVal.split(/[-/]/);

  if (parts.length === 3) {
    const [p1, p2, p3] = parts;
    // If YYYY-MM-DD or YYYY/MM/DD
    if (p1.length === 4) {
      return `${p3.padStart(2, "0")}/${p2.padStart(2, "0")}/${p1}`;
    }
    // If DD-MM-YYYY or DD/MM/YYYY
    if (p3.length === 4) {
      return `${p1.padStart(2, "0")}/${p2.padStart(2, "0")}/${p3}`;
    }
  }

  const dateObj = new Date(val);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return String(val);
};

// Convert DD/MM/YYYY string to YYYY-MM-DD for backend state
const formatToYYYYMMDD = (val: string): string => {
  const clean = val.replace(/\D/g, "");
  if (clean.length === 8) {
    const day = clean.slice(0, 2);
    const month = clean.slice(2, 4);
    const year = clean.slice(4, 8);
    return `${year}-${month}-${day}`;
  }
  return "";
};

export const BaseDatePicker = forwardRef<
  HTMLInputElement,
  DatePickerProps & { error?: string }
>(
  (
    {
      label,
      required,
      error,
      maxDate,
      className = "",
      value,
      onChange,
      name,
      ...props
    },
    ref,
  ) => {
    const hiddenDateInputRef = useRef<HTMLInputElement | null>(null);

    // Keep active visual display formatted as DD/MM/YYYY
    const [displayVal, setDisplayVal] = useState<string>(() =>
      formatToDDMMYYYY(value),
    );

    // Synchronize whenever async form data (e.g. edit mode / reset) loads
    useEffect(() => {
      setDisplayVal(formatToDDMMYYYY(value));
    }, [value]);

    const hiddenInputValue =
      formatToYYYYMMDD(displayVal) || (value as string) || "";

    const handleOpenPicker = () => {
      if (hiddenDateInputRef.current) {
        try {
          hiddenDateInputRef.current.showPicker();
        } catch (e) {
          hiddenDateInputRef.current.focus();
        }
      }
    };

    // Auto-insert slashes while user types
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawVal = e.target.value.replace(/\D/g, "");
      if (rawVal.length > 8) rawVal = rawVal.slice(0, 8);

      let formatted = rawVal;
      if (rawVal.length >= 3 && rawVal.length <= 4) {
        formatted = `${rawVal.slice(0, 2)}/${rawVal.slice(2)}`;
      } else if (rawVal.length > 4) {
        formatted = `${rawVal.slice(0, 2)}/${rawVal.slice(2, 4)}/${rawVal.slice(4, 8)}`;
      }

      setDisplayVal(formatted);
      const isoDate = formatToYYYYMMDD(formatted);

      if (onChange) {
        onChange(isoDate || (formatted as any));
      }
    };

    // Calendar popover date selection
    const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedValue = e.target.value; // YYYY-MM-DD
      const formatted = formatToDDMMYYYY(selectedValue);
      setDisplayVal(formatted);

      if (onChange) {
        onChange(selectedValue as any);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {required && <span className="text-[#ee613e]">*</span>}
          </label>
        )}
        <div className="relative">
          {/* Visible DD/MM/YYYY Text Field */}
          <input
            type="text"
            ref={ref}
            name={name}
            placeholder="DD/MM/YYYY"
            value={displayVal}
            onChange={handleTextChange}
            maxLength={10}
            className={`w-full h-[40px] pl-3 pr-10 border rounded-[10px] text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition-colors ${
              error
                ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                : "border-[#d1d5dc] focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
            } ${className}`}
            {...props}
          />

          {/* Calendar Icon Button with Hidden Native Input Anchored inside it */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <button
              type="button"
              onClick={handleOpenPicker}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              tabIndex={-1}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  strokeWidth="2"
                />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              </svg>
            </button>

            {/* Hidden Input positioned strictly beneath the calendar icon */}
            <input
              type="date"
              ref={hiddenDateInputRef}
              max={maxDate}
              value={hiddenInputValue}
              onChange={handleNativeDateChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
              tabIndex={-1}
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  },
);

BaseDatePicker.displayName = "BaseDatePicker";

export function CustomDatePicker(props: DatePickerProps) {
  const formContext = useFormContext();

  if (formContext) {
    const {
      control,
      formState: { errors },
    } = formContext;

    const getNestedError = (obj: any, path: string): string | undefined => {
      const errorObj = path.split(".").reduce((acc, part) => acc?.[part], obj);
      return errorObj?.message;
    };

    const errorMessage = getNestedError(errors, props.name);

    return (
      <Controller
        name={props.name}
        control={control}
        render={({ field: { onChange, value, ref } }) => (
          <BaseDatePicker
            {...props}
            ref={ref}
            value={value ?? ""}
            onChange={onChange}
            error={errorMessage}
          />
        )}
      />
    );
  }

  return <BaseDatePicker {...props} value={props.value} />;
}
