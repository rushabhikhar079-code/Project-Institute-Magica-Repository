import { FilterField } from "../../components/common/SearchFilter/types";
import type { BranchForm } from "./branchTypes";

export const EMPTY_BRANCH: Omit<BranchForm, "id"> = {
  name: "",
  code: "",
  address: "",

  country: "India",
  countryId: 1,

  state: "",
  stateId: 0,

  city: "",
  cityId: 0,

  pinCode: "",
  phone: "",
  email: "",

  taxRate: "",
  status: "Active",

  contactName: "",
  contactMobile: "",
  contactEmail: "",

  location: "",
  contact: "",
  otherCity: "",
};
export const inp =
  "w-full h-[40px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] text-sm bg-white transition-all placeholder:text-gray-400";

export const lbl = "block text-sm font-medium text-gray-700 mb-1.5";

export const fields: FilterField[] = [
  {
    key: "contactPerson",
    label: "Contact Person",
    type: "text",
    placeholder: "Contact Person Name",
  },
  {
    key: "email",
    label: "Email",
    type: "text",
    placeholder: "abc@gmail.com",
  },
  {
    key: "mobile",
    label: "Contact Number",
    type: "text",
    placeholder: "Contact Number",
  },
  {
    key: "city",
    label: "City",
    type: "text",
    placeholder: "City",
  },
  {
    key: "status",
    label: "Status",
    type: "radio",
    options: [
      { label: "All", value: "2" },
      { label: "Active", value: "1" },
      { label: "Inactive", value: "0" },
    ],
  },
];
