import {
  FilePlus2,
  List,
  FileInput,
  Facebook,
  PhoneCall,
  UserRoundCheck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const enquiryTabs = [
  {
    name: "Enquiry List",
    path: "/enquiry/list",
    icon: List,
  },
  {
    name: "Add Enquiry",
    path: "/enquiry/add",
    icon: FilePlus2,
  },
  {
    name: "Import Enquiry",
    path: "/enquiry/import",
    icon: FileInput,
  },
  {
    name: "Import Enquiry from Facebook",
    path: "/enquiry/importfacebook",
    icon: Facebook,
  },
  {
    name: "Enquiry followup",
    path: "/enquiry/enqfollowup",
    icon: PhoneCall,
  },
  {
    name: "Enquiry Allocation",
    path: "/enquiry/enqallocation",
    icon: UserRoundCheck,
  },
];

export default function EnquiryTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = location.pathname
    .toLowerCase()
    .startsWith("/enquiry/edit/");

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      <div className="flex items-center gap-1 overflow-x-auto">
        {enquiryTabs.map((tab) => {
          const Icon = tab.icon;

          const isAddEditTab = tab.path === "/enquiry/add";

          const isActive = isEditMode
            ? isAddEditTab
            : location.pathname.toLowerCase() === tab.path.toLowerCase();

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

              <span>
                {isAddEditTab && isEditMode ? "Edit Enquiry" : tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
