import type { FilterField } from "../../../components/common/SearchFilter/types";

export const enquiryFilterFields: FilterField[] = [
  // Row 1: Contact Information
  {
    key: "phone",
    label: "Phone",
    type: "text",
    placeholder: "Phone number",
  },
  {
    key: "email",
    label: "Email",
    type: "text",
    placeholder: "email@example.com",
  },
  {
    key: "contact-spacer",
    label: "",
    type: "spacer",
  },

  // Row 2: Date & Enquiry Filters
  {
    key: "regFrDate",
    label: "Enquiry From Date",
    type: "date",
  },
  {
    key: "regToDate",
    label: "Enquiry To Date",
    type: "date",
  },
  {
    key: "enquiryStatus",
    label: "Enquiry Status",
    type: "select",
    options: [
      {
        label: "New",
        value: 1,
      },
      {
        label: "Hot",
        value: 2,
      },
      {
        label: "Warm",
        value: 3,
      },
      {
        label: "Cold",
        value: 4,
      },
      {
        label: "Dead",
        value: 5,
      },
    ],
  },

  // Row 3: Academic Hierarchy
  {
    key: "curriculumId",
    label: "Curriculum",
    type: "select",
    options: [],
  },
  {
    key: "courseId",
    label: "Course",
    type: "select",
    options: [],
  },
  {
    key: "subId",
    label: "Subject",
    type: "select",
    options: [],
  },

  {
    key: "batchId",
    label: "Batch",
    type: "select",
    options: [],
    renderWith: "notInBatch",
  },
  {
    key: "notInBatch",
    label: "",
    type: "checkbox",
    options: [
      {
        label: "Not in any batch",
        value: true,
      },
    ],
  },

  // Row 5: System Flags & Toggles
  {
    key: "status",
    label: "Status",
    type: "radio",
    options: [
      {
        label: "All",
        value: 2,
      },
      {
        label: "Active",
        value: 1,
      },
      {
        label: "Inactive",
        value: 0,
      },
    ],
  },
  {
    key: "status-spacer",
    label: "",
    type: "spacer",
  },
  {
    key: "allBranches",
    label: "",
    type: "checkbox",
    wrapperClassName: "pt-5",
    options: [
      {
        label: "Search in all branches",
        value: true,
      },
    ],
  },
];
