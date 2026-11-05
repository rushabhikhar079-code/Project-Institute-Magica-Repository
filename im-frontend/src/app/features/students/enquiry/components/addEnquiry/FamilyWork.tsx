import { BriefcaseBusiness, Users } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { TextBox } from "../../../../../components/common/TextBox";
import { Dropdown } from "../../../../../components/common/Select";
import type { EnquiryFormData } from "../../addEnquiryTypes";

const workingOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];
function GroupBadge({
  label,
  color,
}: {
  label: string;
  color: "blue" | "rose";
}) {
  const cls =
    color === "blue" ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-600";
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest ${cls}`}
      >
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}
export default function Family() {
  const { control } = useFormContext<EnquiryFormData>();

  const working = useWatch({
    control,
    name: "Working",
  });

  return (
    <div className="space-y-5">
      {/* =====================================================
          FAMILY DETAILS
      ===================================================== */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-[#0F4C81]" />
          </div>

          <h2 className="text-base font-semibold text-gray-800">
            Family Details
          </h2>
        </div>

        <SectionTitle title="Father/Guardian Details" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <TextBox
            name="FatherFName"
            label="First Name"
            placeholder="First name"
            required={false}
            allowOnly="alpha"
          />

          <TextBox
            name="FatherMName"
            label="Middle Name"
            placeholder="Middle name"
            required={false}
            allowOnly="alpha"
          />

          <TextBox
            name="FatherLName"
            label="Last Name"
            placeholder="Last name"
            required={false}
            allowOnly="alpha"
          />

          <TextBox
            name="FMobile"
            label="Contact Number"
            placeholder="Enter mobile number"
            required={false}
            allowOnly="numeric"
            maxLength={15}
          />
        </div>

        <SectionTitle title="Mother Details" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <TextBox
            name="MotherFName"
            label="First Name"
            placeholder="First name"
            required={false}
            allowOnly="alpha"
          />

          <TextBox
            name="MotherMName"
            label="Middle Name"
            placeholder="Middle name"
            required={false}
            allowOnly="alpha"
          />

          <TextBox
            name="MotherLName"
            label="Last Name"
            placeholder="Last name"
            required={false}
            allowOnly="alpha"
          />

          <TextBox
            name="MMobile"
            label="Contact Number"
            placeholder="Enter mobile number"
            required={false}
            allowOnly="numeric"
            maxLength={15}
          />
        </div>

        <SectionTitle title="Parent's Employer Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <TextBox
            name="ParentCompanyName"
            label="Parent's Company Name"
            placeholder="Enter Parent's Company Name"
            required={false}
          />

          <TextBox
            name="GSTNumber"
            label="GST Number (If Applicable)"
            placeholder="Enter GST Number"
            required={false}
            allowOnly="numeric"
            maxLength={50}
          />
        </div>
      </section>
      {/* =====================================================
          WORKING DETAILS
      ===================================================== */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
            <BriefcaseBusiness className="w-4 h-4 text-[#0F4C81]" />
          </div>

          <h2 className="text-base font-semibold text-gray-800">
            Working Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <Dropdown
              name="Working"
              label="Currently Working ?"
              options={workingOptions}
            />
          </div>
          {/* Second row */}
          {working === "Yes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:col-span-2">
              <TextBox
                name="Occupation"
                label="Occupation"
                placeholder="Enter occupation"
                required={false}
                allowOnly="alpha"
              />

              <TextBox
                name="OrgName"
                label="Name of Organization"
                placeholder="Enter organization name"
                required={false}
              />

              <TextBox
                name="Salary"
                label="Salary"
                placeholder="Enter salary"
                required={false}
                allowOnly="numeric"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-bold text-[#0F4C81] uppercase tracking-widest whitespace-nowrap">
        {title}
      </span>

      <div className="flex-1 h-px bg-[#0F4C81]/15" />
    </div>
  );
}
