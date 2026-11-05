import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import useBreadcrumb, { BreadcrumbItem } from "../../../hooks/useBreadcrumb";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title?: string;
  description?: string;

  extraBreadcrumbs?: BreadcrumbItem[];
  breadcrumbOverride?: BreadcrumbItem[];
  actionButton?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
}
const PageHeader = ({
  title,
  description,
  extraBreadcrumbs = [],
  breadcrumbOverride,
  actionButton,
}: PageHeaderProps) => {
  const { breadcrumbs } = useBreadcrumb();

  const allBreadcrumbs = breadcrumbOverride ?? [
    ...breadcrumbs,
    ...extraBreadcrumbs,
  ];

  const pageTitle =
    title ||
    (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : "");
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col mb-2">
      {/* Breadcrumb */}
      <div className="flex items-center flex-wrap text-sm text-gray-500 mb-3">
        {allBreadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center">
            <span
              onClick={() => {
                console.log("Breadcrumb clicked:", item);
                if (item.path) {
                  navigate(item.path);
                }
              }}
              className={`${
                item.path ? "cursor-pointer hover:text-[#0F4C81]" : ""
              } ${
                index === allBreadcrumbs.length - 1
                  ? "font-medium text-[#0F4C81]"
                  : ""
              }`}
            >
              {item.label}
            </span>

            {index < allBreadcrumbs.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1"></div>

        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="self-start sm:ml-auto flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d6a] transition-colors"
          >
            {actionButton.icon}
            <span>{actionButton.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
