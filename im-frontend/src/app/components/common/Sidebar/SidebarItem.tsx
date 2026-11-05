import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type SidebarItemProps = {
  name: string;
  icon: ReactNode;
  active: boolean;
  hasDropdown: boolean;
  isOpen: boolean;
  onClick: () => void;
};

export function SidebarItem({
  name,
  icon,
  active,
  hasDropdown,
  isOpen,
  onClick,
}: SidebarItemProps) {
  return (
    <div>
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-5 py-2.5 rounded-lg transition-colors duration-200 ${
          active
            ? "bg-[#073967] text-white font-semibold shadow-inner"
            : "text-white/90 hover:bg-white/10 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={active ? "text-sky-300" : "text-sky-200/80"}>
            {icon}
          </span>

          <span className="font-normal text-sm">{name}</span>
        </div>

        {hasDropdown && (
          <ChevronDown
            className={`w-4 h-4 text-sky-200/80 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>
    </div>
  );
}
