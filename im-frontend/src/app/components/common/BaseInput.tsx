// import { InputHTMLAttributes } from "react";

// interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   required?: boolean;
//   error?: string;
// }

// export function BaseInput({
//   label,
//   required,
//   error,
//   className = "",
//   ...props
// }: BaseInputProps) {
//   return (
//     <div>
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           {label} {required && <span className="text-[#ee613e]">*</span>}
//         </label>
//       )}
//       <input
//         {...props}
//         autoComplete="one-time-code"
//         className={`w-full h-[40px] px-4 border rounded-[10px] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
//           error
//             ? "border-red-500 focus:ring-red-200 focus:border-red-500"
//             : "border-[#d1d5dc] focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
//         } ${className}`}
//       />
//       {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
//     </div>
//   );
// }

import { forwardRef, InputHTMLAttributes } from "react";

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  (
    { label, required, error, className = "", ...props },
    ref, // Forwarded ref added here
  ) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {required && <span className="text-[#ee613e]">*</span>}
          </label>
        )}
        <input
          ref={ref} // Attached ref here
          {...props}
          autoComplete="one-time-code"
          className={`w-full h-[40px] px-4 border rounded-[10px] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
            error
              ? "border-red-500 focus:ring-red-200 focus:border-red-500"
              : "border-[#d1d5dc] focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
          } ${className}`}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  },
);

BaseInput.displayName = "BaseInput";
