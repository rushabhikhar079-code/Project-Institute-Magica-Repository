import React from "react";
import {
  Save,
  X,
  Trash2,
  Check,
  Search,
  Plus,
  Loader2,
  LucideIcon,
} from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";
export type ButtonPreset =
  | "save"
  | "submit"
  | "update"
  | "cancel"
  | "delete"
  | "search"
  | "clear"
  | "add";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  preset?: ButtonPreset;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  isLoading?: boolean;
  children?: React.ReactNode;
  size?: "sm" | "md";
}

export const Button: React.FC<ButtonProps> = ({
  preset,
  variant,
  icon: CustomIcon,
  isLoading = false,
  children,
  className = "",
  disabled,
  size = "md",
  type = "button",
  ...props
}) => {
  let finalVariant: ButtonVariant = variant || "primary";
  let IconComponent: LucideIcon | null = CustomIcon || null;
  let defaultLabel = children;

  if (preset) {
    switch (preset) {
      case "save":
        finalVariant = variant || "primary";
        IconComponent = CustomIcon || Save;
        defaultLabel = children || "Save";
        break;
      case "update":
        finalVariant = variant || "primary";
        IconComponent = CustomIcon || Save;
        defaultLabel = children || "Update";
        break;
      case "submit":
        finalVariant = variant || "primary";
        IconComponent = CustomIcon || Check;
        defaultLabel = children || "Submit";
        break;
      case "cancel":
        finalVariant = variant || "secondary";
        IconComponent = CustomIcon || X;
        defaultLabel = children || "Cancel";
        break;
      case "delete":
        finalVariant = variant || "danger";
        IconComponent = CustomIcon || Trash2;
        defaultLabel = children || "Delete";
        break;
      case "search":
        finalVariant = variant || "primary";
        IconComponent = CustomIcon || Search;
        defaultLabel = children || "Search";
        break;
      case "clear":
        finalVariant = variant || "secondary";
        IconComponent = CustomIcon || X;
        defaultLabel = children || "Clear";
        break;
      case "add":
        finalVariant = variant || "outline";
        IconComponent = CustomIcon || Plus;
        defaultLabel = children || "Add";
        break;
    }
  }

  // Base styling matching your buttons
  const baseStyles =
    "flex items-center justify-center gap-2 rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  // Size map
  const sizeStyles = {
    sm: "px-4 py-2 text-xs font-medium",
    md: "px-4 py-2 text-sm font-medium",
  };

  // Color variants matching your exact tailwind classes
  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#0F4C81] text-white hover:bg-[#0d3f6b]",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline:
      "border border-[#0F4C81] text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white",
  };

  // Auto-apply 'sm' size for 'add' preset
  const finalSize = preset === "add" && size === "md" ? "sm" : size;

  return (
    <button
      type={
        preset === "submit" ||
        preset === "save" ||
        preset === "update" ||
        preset === "search"
          ? "submit"
          : type
      }
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[finalSize]} ${variantStyles[finalVariant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : IconComponent ? (
        <IconComponent className="w-4 h-4" />
      ) : null}
      <span>{defaultLabel}</span>
    </button>
  );
};
