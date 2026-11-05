import { ReactNode } from "react";

type SidebarSubItemProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
};

export function SidebarSubItem({
  label,
  active,
  onClick,
  icon,
}: SidebarSubItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 pl-4 pr-4 py-2 rounded-md transition-colors duration-200 text-xs font-medium text-left ${
        active
          ? "bg-[#00264D] font-semibold border-l-4 border-sky-400"
          : "text-sky-100/80 hover:bg-[#07243F] hover:text-white"
      }`}
    >
      <span className={active ? "text-sky-300" : "text-sky-300/70"}>
        {icon}
      </span>

      {label}
    </button>
  );
}
