import { Outlet, useLocation } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import AdmissionTabs from "./AdmissionTabs";

const admissionBreadcrumbLabels: Record<string, string> = {
  "/admission/add": "Add Admission",
  "/admission/list": "Admission List",
  "/admission/import": "Import Admission",
  "/admission/announcements": "Announcements",
  "/admission/documents": "Manage Document",
};

export default function Admission() {
  const location = useLocation();

  const currentPage =
    admissionBreadcrumbLabels[location.pathname.toLowerCase()] ||
    "Add Admission";

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        breadcrumbOverride={[
          {
            label: "Students",
            path: "/students",
          },
          {
            label: "Admission",
            path: "/admission",
          },
          {
            label: currentPage,
          },
        ]}
      />

      <div className="px-6 pb-6">
        <AdmissionTabs />

        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
