import React, { useState, useRef, useEffect } from "react";
import { useFormContext, useController } from "react-hook-form";

interface Option {
  label: string;
  value: string | number | boolean;
}

interface MultiSelectProps {
  name?: string;
  label?: string;
  required?: boolean;
  options: Option[];
  className?: string;
  value?: (string | number | boolean)[];
  onChange?: (value: (string | number | boolean)[]) => void;
  disabled?: boolean;
}

export function MultiSelectDropdown({
  name,
  label,
  required,
  options,
  className = "",
  value: controlledValue,
  onChange: controlledOnChange,
  disabled = false,
}: MultiSelectProps) {
  const formContext = useFormContext();

  const isControlled = controlledOnChange !== undefined;

  const controller = name
    ? useController({
        name,
        control: formContext.control,
      })
    : null;

  const value: (string | number | boolean)[] = isControlled
    ? (controlledValue ?? [])
    : (controller?.field.value ?? []);

  const onChange = isControlled
    ? controlledOnChange
    : controller?.field.onChange;

  const error = controller?.fieldState.error;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isSelected = (optionValue: string | number | boolean) => {
    return value.some(
      (selectedValue) => String(selectedValue) === String(optionValue),
    );
  };

  const toggleOption = (optionValue: string | number | boolean) => {
    const alreadySelected = isSelected(optionValue);

    const newValue = alreadySelected
      ? value.filter(
          (selectedValue) => String(selectedValue) !== String(optionValue),
        )
      : [...value, optionValue];

    onChange?.(newValue);
  };

  const selectAll = () => {
    onChange?.(options.map((option) => option.value));
  };

  const clearAll = () => {
    onChange?.([]);
  };
  const allSelected =
    options.length > 0 && options.every((option) => isSelected(option.value));
  const selectedOptions = options.filter((option) => isSelected(option.value));

  const displayText =
    selectedOptions.length === 0
      ? "Select Option"
      : selectedOptions.length === 1
        ? selectedOptions[0].label
        : `${selectedOptions.length} selected`;

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-[#ee613e]">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[40px] px-3 flex items-center justify-between rounded-[10px] text-sm bg-white border transition-colors focus:outline-none ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : error?.message
              ? "border-red-500 focus:ring-2 focus:ring-red-200"
              : isOpen
                ? "border-[#0F4C81] ring-2 ring-[#0F4C81]/20"
                : "border-[#d1d5dc] hover:border-gray-400"
        } ${className}`}
      >
        <span
          className={`font-normal truncate ${
            selectedOptions.length > 0 ? "text-gray-700" : "text-gray-400"
          }`}
        >
          {displayText}
        </span>

        <svg
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1">
          {/* Select All / Clear All */}
          {/* Select All */}
          <div
            onClick={() => {
              if (allSelected) {
                clearAll();
              } else {
                selectAll();
              }
            }}
            className="px-3 py-2 border-b border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => {
                if (allSelected) {
                  clearAll();
                } else {
                  selectAll();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 rounded border-gray-300 accent-[#0F4C81]"
            />

            <span className="text-sm text-gray-700">Select All</span>
          </div>
          {/* Options */}
          {options.map((opt) => {
            const selected = isSelected(opt.value);

            return (
              <div
                key={String(opt.value)}
                onClick={() => toggleOption(opt.value)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                  selected
                    ? "bg-[#E9F5FF] text-[#0F4C81] border-b border-[#d6ebf7]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleOption(opt.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-gray-300 accent-[#0F4C81]"
                />

                <span className="truncate">{opt.label}</span>
              </div>
            );
          })}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">
              No options available
            </div>
          )}
        </div>
      )}

      {error?.message && (
        <p className="text-xs text-red-500 mt-0.5">{error.message}</p>
      )}
    </div>
  );
}
