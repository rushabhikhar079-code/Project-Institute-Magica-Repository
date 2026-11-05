import { Outlet, useLocation } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import EnquiryTabs from "./EnquiryTabs";
import { useState } from "react";

const enquiryBreadcrumbLabels: Record<string, string> = {
  "/enquiry/add": "Add Enquiry",
  "/enquiry/list": "Enquiry List",
  "/enquiry/import": "Import Enquiry",
  "/enquiry/importfacebook": "Import Enquiry from facebook",
  "/enquiry/enqfollowup": "Enquiry Followup",
  "/enquiry/enqallocation": "Enquiry Allocation",
};

export default function Enquiry() {
  const location = useLocation();

  const isEditMode = location.pathname
    .toLowerCase()
    .startsWith("/enquiry/edit/");

  const [studentName, setStudentName] = useState("");

  let currentPage = "Add Enquiry";

  if (isEditMode) {
    currentPage = studentName
      ? `Edit Enquiry - ${studentName}`
      : "Edit Enquiry";
  } else {
    currentPage =
      enquiryBreadcrumbLabels[location.pathname.toLowerCase()] || "Add Enquiry";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        breadcrumbOverride={[
          {
            label: "Students",
            path: "/students",
          },
          {
            label: "Enquiry",
            path: "/enquiry",
          },
          {
            label: currentPage,
          },
        ]}
      />

      <div className="px-6 pb-6">
        <EnquiryTabs />

        <div className="mt-6">
          <Outlet context={{ setStudentName }} />
        </div>
      </div>
    </div>
  );
}
