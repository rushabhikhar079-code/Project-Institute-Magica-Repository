// import { useFormContext } from "react-hook-form";

// interface TextBoxProps {
//   name: string;
//   label: string;
//   placeholder?: string;
//   required?: boolean;
// }

// export function TextBox({
//   name,
//   label,
//   placeholder,
//   required = true,
// }: TextBoxProps) {
//   const {
//     register,
//     formState: { errors },
//   } = useFormContext();
//   const errorMessage = errors[name]?.message as string | undefined;

//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//         {label} {required && <span className="text-[#ee613e]">*</span>}
//       </label>
//       <input
//         type="text"
//         placeholder={placeholder}
//         autoComplete="one-time-code"
//         {...register(name)}
//         className={`w-full h-[46px] px-4 border rounded-[10px] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
//           errorMessage
//             ? "border-red-500 focus:ring-red-200 focus:border-red-500" // 🔴 Red border & subtle red glow when active
//             : "border-[#d1d5dc] focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]" // 🔵 Clean blue focus outline
//         }`}
//       />
//       {errorMessage && (
//         <p className="text-xs text-red-500 mt-0.5">{errorMessage}</p>
//       )}
//     </div>
//   );
// }

// import { useFormContext } from "react-hook-form";
// import { BaseInput } from "./BaseInput";

// interface TextBoxProps {
//   name: string;
//   label: string;
//   placeholder?: string;
//   required?: boolean;
//   allowOnly?:
//     | "numeric"
//     | "alpha"
//     | "alphanumeric"
//     | "noSpecialChars"
//     | "address";
//   type?: "text" | "email" | "password";
//   maxLength?: number;
//   disabled?: boolean;
// }

// export function TextBox({
//   name,
//   label,
//   placeholder,
//   required = true,
//   allowOnly,
//   type = "text",
//   maxLength,
//   disabled,
// }: TextBoxProps) {
//   const {
//     register,
//     formState: { errors },
//   } = useFormContext();
//   const errorMessage = errors[name]?.message as string | undefined;
//   const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
//     let value = e.currentTarget.value;
//     switch (allowOnly) {
//       case "numeric":
//         value = value.replace(/\D/g, ""); // Digits only
//         break;
//       case "alpha":
//         value = value.replace(/[^a-zA-Z\s]/g, ""); // Letters and spaces only
//         break;
//       case "alphanumeric":
//         value = value.replace(/[^a-zA-Z0-9]/g, ""); // Letters & numbers only (no spaces/symbols)
//         break;
//       case "noSpecialChars":
//         value = value.replace(/[^a-zA-Z0-9\s.-]/g, ""); // Letters, numbers, spaces, dots, hyphens
//         break;
//       case "address":
//         value = value.replace(/[^a-zA-Z0-9\s,./#-]/g, ""); // Letters, numbers, spaces, and address punctuation
//         break;
//     }

//     e.currentTarget.value = value;
//   };
//   return (
//     <BaseInput
//       {...register(name)}
//       label={label}
//       required={required}
//       type={type}
//       placeholder={placeholder}
//       onInput={handleInput}
//       error={errorMessage}
//       maxLength={maxLength}
//       disabled={disabled}
//     />
//   );
// }
import { useFormContext } from "react-hook-form";
import { BaseInput } from "./BaseInput";

interface TextBoxProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  allowOnly?:
    | "numeric"
    | "alpha"
    | "alphanumeric"
    | "noSpecialChars"
    | "address";
  type?: "text" | "email" | "password";
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

// Helper to resolve nested object paths like "subscription.noOfBranches"
const getNestedError = (errors: any, path: string): string | undefined => {
  return path.split(".").reduce((acc, part) => acc?.[part], errors)?.message;
};

export function TextBox({
  name,
  label,
  placeholder,
  required = true,
  allowOnly,
  type = "text",
  maxLength,
  disabled,
  readOnly = false,
}: TextBoxProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Dynamically traverse nested errors object
  const errorMessage = getNestedError(errors, name);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value;
    switch (allowOnly) {
      case "numeric":
        value = value.replace(/\D/g, ""); // Digits only
        break;
      case "alpha":
        value = value.replace(/[^a-zA-Z\s]/g, ""); // Letters and spaces only
        break;
      case "alphanumeric":
        value = value.replace(/[^a-zA-Z0-9]/g, ""); // Letters & numbers only (no spaces/symbols)
        break;
      case "noSpecialChars":
        value = value.replace(/[^a-zA-Z0-9\s.-]/g, ""); // Letters, numbers, spaces, dots, hyphens
        break;
      case "address":
        value = value.replace(/[^a-zA-Z0-9\s,./#-]/g, ""); // Letters, numbers, spaces, and address punctuation
        break;
    }

    e.currentTarget.value = value;
  };

  return (
    <BaseInput
      {...register(name)}
      label={label}
      required={required}
      type={type}
      placeholder={placeholder}
      onInput={handleInput}
      error={errorMessage}
      maxLength={maxLength}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
}
