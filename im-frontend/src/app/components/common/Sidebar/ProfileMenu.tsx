import { RefreshCw, School, User, UserCircle } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSubItem } from "./SidebarSubitem";

type ProfileMenuProps = {
  open: boolean;
  activeSubMenuItem: string;
  onToggle: () => void;
  onNavigate: (page: string, menuItem: string, subItem?: string) => void;
};

const profileItems = [
  {
    label: "My Profile",
    icon: <User className="w-4 h-4" />,
  },
  {
    label: "Edit Profile",
    icon: <UserCircle className="w-4 h-4" />,
  },
  {
    label: "Change Password",
    icon: <RefreshCw className="w-4 h-4" />,
  },
  {
    label: "Institute Profile",
    icon: <School className="w-4 h-4" />,
  },
];

export function ProfileMenu({
  open,
  activeSubMenuItem,
  onToggle,
  onNavigate,
}: ProfileMenuProps) {
  return (
    <>
      <SidebarItem
        name="Profile"
        icon={<UserCircle className="w-5 h-5" />}
        active={open}
        hasDropdown
        isOpen={open}
        onClick={onToggle}
      />

      {open && (
        <div className="mt-1 mb-2 ml-2 pl-2 border-l-2 border-sky-400/30 space-y-1 bg-[#093256] p-1.5 rounded-md">
          {profileItems.map((item) => (
            <SidebarSubItem
              key={item.label}
              label={item.label}
              active={activeSubMenuItem === item.label}
              onClick={() => onNavigate(item.label, "Profile", item.label)}
              icon={item.icon}
            />
          ))}
        </div>
      )}
    </>
  );
}
