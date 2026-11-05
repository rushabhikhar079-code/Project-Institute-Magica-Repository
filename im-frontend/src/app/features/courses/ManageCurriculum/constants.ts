import { FilterField } from "../../../components/common/SearchFilter/types";

export const inp =
  "w-full h-[40px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] text-sm bg-white transition-all placeholder:text-gray-400";

export const lbl = "block text-sm font-medium text-gray-700 mb-1.5";

export const fields: FilterField[] = [
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
