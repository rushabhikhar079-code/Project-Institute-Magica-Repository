import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { X } from "lucide-react";

export type ModalFieldType =
  | "text"
  | "date"
  | "select"
  | "textarea"
  | "readonly";

export interface ModalFieldConfig<T> {
  key: keyof T | string;
  label: string;
  type: ModalFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[]; // For select inputs
  render?: (record: T) => React.ReactNode; // Custom display for readonly fields
}

interface FormModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  record: T | null;
  fields: ModalFieldConfig<T>[];
  onSave: (formData: Record<string, any>) => Promise<void>;
  submitText?: string;
  cancelText?: string;
}

export function FormModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  title = "Confirmation Message",
  record,
  fields,
  onSave,
  submitText = "Yes",
  cancelText = "No",
}: FormModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      const initialData: Record<string, any> = {};

      fields.forEach((field) => {
        const val = record[field.key as keyof T];

        if (field.type === "date" && typeof val === "string") {
          initialData[field.key as string] = val.includes("T")
            ? val.split("T")[0]
            : val;
        } else {
          initialData[field.key as string] = val ?? "";
        }
      });

      setFormData(initialData);
    }
  }, [record, fields]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Calculate number of days
  useEffect(() => {
    const startDate = formData["startDate"];
    const endDate = formData["endDate"];

    if (!startDate || !endDate) {
      return;
    }

    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);

    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    if (end >= start) {
      const diffTime = end.getTime() - start.getTime();

      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      setFormData((prev) => ({
        ...prev,
        days: diffDays,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        days: 0,
      }));
    }
  }, [formData.startDate, formData.endDate]);

  // Submit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("FormModal submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ ONLY NOW do the conditional return
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0F4C81] px-6 py-3.5 text-white">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3 text-sm">
          {fields.map((field) => {
            const keyStr = field.key as string;
            const currentValue = formData[keyStr];
            const rawRecordValue = record[field.key as keyof T];

            return (
              <div key={keyStr} className="grid grid-cols-12 items-center">
                {/* block text-sm font-medium text-gray-700 mb-1.5 */}
                <label className="col-span-4 text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <span className="col-span-1 text-sm font-medium text-gray-700">
                  :
                </span>

                <div className="col-span-7">
                  {/* Readonly Display */}
                  {field.type === "readonly" && (
                    <span className="text-sm font-medium text-gray-700">
                      {field.render
                        ? field.render(record)
                        : (currentValue ?? "N/A")}
                    </span>
                  )}

                  {/* Date Input */}
                  {field.type === "date" && (
                    <input
                      type="date"
                      value={currentValue || ""}
                      onChange={(e) => handleChange(keyStr, e.target.value)}
                      required={field.required}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#0F4C81] focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                    />
                  )}

                  {/* Text Input */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      value={currentValue || ""}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(keyStr, e.target.value)}
                      required={field.required}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#0F4C81] focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                    />
                  )}

                  {/* Textarea */}
                  {field.type === "textarea" && (
                    <textarea
                      rows={2}
                      value={currentValue || ""}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(keyStr, e.target.value)}
                      required={field.required}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#0F4C81] focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                    />
                  )}

                  {/* Select Dropdown */}
                  {field.type === "select" && (
                    <div className="flex items-center gap-2">
                      <select
                        value={currentValue}
                        onChange={(e) => handleChange(keyStr, e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#0F4C81] focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {/* Active indicator dot */}
                      {/* <span
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          Number(currentValue) === 1
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      /> */}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
            <Button preset="submit" isLoading={submitting} type="submit">
              {submitText}
            </Button>
            <Button preset="cancel" onClick={onClose} type="button">
              {cancelText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
