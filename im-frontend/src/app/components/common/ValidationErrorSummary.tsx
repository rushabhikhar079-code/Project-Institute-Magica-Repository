import React from "react";
import { AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/redux/store";
import { clearGlobalError } from "../../../app/redux/slices/errorSlice";

const ValidationErrorSummary: React.FC = () => {
  const dispatch = useDispatch();

  const { status, errors } = useSelector((state: RootState) => state.error);

  if (status !== 400 || errors.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertCircle size={14} className="mt-0.5 shrink-0 text-[#800000]" />
        <div>
          <p className="text-sm font-semibold text-red-700">
            Please fix the following errors:
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-[#800000] marker:text-xs">
            {errors.map((error, index) => (
              <li key={index}>
                <span className="text-sm text-[#800000]">{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationErrorSummary;
