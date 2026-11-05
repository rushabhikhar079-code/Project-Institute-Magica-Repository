import { FilePlus2, List, FileInput, Send, FolderOpen } from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

const admissionTabs = [
  {
    name: "Admission List",
    path: "/admission/list",
    icon: List,
  },
  {
    name: "Add Admission",
    path: "/admission/add",
    icon: FilePlus2,
  },
  {
    name: "Import Admission",
    path: "/admission/import",
    icon: FileInput,
  },
  {
    name: "Announcements",
    path: "/admission/announcements",
    icon: Send,
  },
  {
    name: "Manage Document",
    path: "/admission/documents",
    icon: FolderOpen,
  },
];

export default function AdmissionTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      <div className="flex items-center gap-1 overflow-x-auto">
        {admissionTabs.map((tab) => {
          const Icon = tab.icon;

          const isActive =
            location.pathname.toLowerCase() === tab.path.toLowerCase();

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`
                flex
                items-center
                gap-2
                whitespace-nowrap
                rounded-lg
                px-4
                py-2.5
                text-sm
                font-medium
                transition-colors
                duration-200

                ${
                  isActive
                    ? "bg-[#0F4C81] text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#0F4C81]"
                }
              `}
            >
              <Icon className="h-4 w-4" />

              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
