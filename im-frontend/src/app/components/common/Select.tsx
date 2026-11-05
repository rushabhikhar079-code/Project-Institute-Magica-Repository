import React, { useState, useRef, useEffect } from "react";
import { useFormContext, useController } from "react-hook-form";

interface Option {
  label: string;
  value: string | number | boolean;
}

interface SelectProps {
  name?: string;
  label?: string;
  required?: boolean;
  options: Option[];
  className?: string;
  value?: string | number | boolean | undefined;
  onChange?: (value: string | number | boolean | undefined) => void;
  disabled?: boolean;
}

export function Dropdown({
  name,
  label,
  required,
  options,
  className = "",
  value: controlledValue,
  onChange: controlledOnChange,
  disabled = false,
}: SelectProps) {
  const formContext = useFormContext();

  const isControlled = controlledOnChange !== undefined;

  const controller = name
    ? useController({
        name,
        control: formContext.control,
      })
    : null;

  const value = isControlled ? controlledValue : controller?.field.value;

  const onChange = isControlled
    ? controlledOnChange
    : controller?.field.onChange;

  const error = controller?.fieldState.error;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );

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
          className={`font-normal ${
            selectedOption ? "text-gray-700" : "text-gray-400"
          }`}
        >
          {selectedOption ? selectedOption.label : "Select Option"}
        </span>

        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
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
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1">
          {/* Clear selection */}
          <div
            onClick={() => {
              onChange?.(0);
              setIsOpen(false);
            }}
            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
              value === "" || value == null
                ? "bg-[#0F4C81] text-white"
                : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            Select Option
          </div>

          {/* Dropdown options */}
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);

            return (
              <div
                key={String(opt.value)}
                onClick={() => {
                  onChange?.(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#0F4C81] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}

      {error?.message && (
        <p className="text-xs text-red-500 mt-0.5">{error.message}</p>
      )}
    </div>
  );
}
