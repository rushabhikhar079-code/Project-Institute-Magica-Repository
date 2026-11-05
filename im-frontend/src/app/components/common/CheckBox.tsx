import React from "react";
import { useFormContext } from "react-hook-form";

interface CheckBoxProps {
  name: string;
  label: string;
  className?: string;
}

export function CheckBox({ name, label, className = "" }: CheckBoxProps) {
  const { register } = useFormContext();

  return (
    <label
      className={`flex items-center gap-2 text-sm text-gray-700 cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        {...register(name)}
        className="w-4 h-4 rounded border-gray-300 text-[#0f4c81] focus:ring-[#0f4c81] cursor-pointer"
      />
      <span>{label}</span>
    </label>
  );
}
