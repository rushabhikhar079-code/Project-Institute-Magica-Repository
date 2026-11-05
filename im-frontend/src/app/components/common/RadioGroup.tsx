// import React from "react";
// import { useFormContext } from "react-hook-form";

// interface RadioOption {
//   label: string;
//   value: string | number | boolean;
// }

// interface RadioGroupProps {
//   name: string;
//   label?: string;
//   options: RadioOption[];
//   required?: boolean;
// }

// export function RadioGroup({
//   name,
//   label,
//   options,
//   required,
// }: RadioGroupProps) {
//   const {
//     register,
//     formState: { errors },
//   } = useFormContext();
//   const errorMessage = errors[name]?.message as string | undefined;

//   return (
//     <div>
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           {label} {required && <span className="text-[#ee613e]">*</span>}
//         </label>
//       )}
//       <div className="flex items-center gap-4 h-[40px]">
//         {options.map((opt) => (
//           <label
//             key={String(opt.value)}
//             className="flex items-center gap-1.5 text-sm cursor-pointer text-gray-700"
//           >
//             <input
//               type="radio"
//               value={String(opt.value)}
//               {...register(name)}
//               className="w-4 h-4 accent-[#0F4C81] disabled:cursor-not-allowed"
//             />
//             {opt.label}
//           </label>
//         ))}
//       </div>
//       {errorMessage && (
//         <p className="text-xs text-red-500 mt-0.5">{errorMessage}</p>
//       )}
//     </div>
//   );
// }
import React from "react";
import { useFormContext, useController } from "react-hook-form";

interface RadioOption {
  label: string;
  value: string | number | boolean;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  required?: boolean;
}

export function RadioGroup({
  name,
  label,
  options,
  required,
}: RadioGroupProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const {
    field: { value, onChange },
  } = useController({ name, control });

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-[#ee613e]">*</span>}
        </label>
      )}
      <div className="flex items-center gap-4 h-[40px]">
        {options.map((opt) => (
          <label
            key={String(opt.value)}
            className="flex items-center gap-1.5 text-sm cursor-pointer text-gray-700"
          >
            <input
              type="radio"
              name={name}
              checked={String(value) === String(opt.value)}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4 accent-[#0F4C81] disabled:cursor-not-allowed"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {errorMessage && (
        <p className="text-xs text-red-500 mt-0.5">{errorMessage}</p>
      )}
    </div>
  );
}
