import { FilterField } from "../../components/common/SearchFilter/types";

export const instituteFilterFields: FilterField[] = [
  {
    key: "contactPerson",
    label: "Contact Person",
    type: "text",
    placeholder: "Contact Person",
  },
  { key: "city", label: "City", type: "text", placeholder: "City" },
  { key: "email", label: "Email", type: "text", placeholder: "Email" },
  { key: "phone", label: "Phone", type: "text", placeholder: "Phone" },
  {
    key: "institutePlan",
    label: "Institute Plan",
    type: "select",
    options: [],
  },
  {
    key: "type",
    label: "Type",
    type: "radio",
    options: [
      { label: "All", value: 2 },
      { label: "Trial", value: 0 },
      { label: "Premium", value: 1 },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "radio",
    options: [
      { label: "All", value: 2 },
      { label: "Active", value: 1 },
      { label: "Inactive", value: 0 },
    ],
  },
  {
    key: "registrationType",
    label: "Registration Type",
    type: "radio",
    options: [
      { label: "All", value: 2 },
      { label: "Internal Use", value: 1 },
      { label: "Clients", value: 0 },
    ],
  },
  { key: "spacer", label: "", type: "spacer" },
  { key: "expiryDateFrom", label: "Expiry Date From", type: "date" },
  { key: "expiryDateTo", label: "Expiry Date To", type: "date" },
];
