import type { FilterField } from "../../../components/common/SearchFilter/types";

export const admissionFilterFields: FilterField[] = [
  //   {
  //     key: "studentName",
  //     label: "Student Name",
  //     type: "text",
  //     placeholder: "Student first, middle or last name",
  //   },
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
  {
    key: "regManual",
    label: "Reg. No.",
    type: "text",
    placeholder: "Registration number",
  },
  {
    key: "regFrDate",
    label: "Reg. From Date",
    type: "date",
  },

  {
    key: "regToDate",
    label: "Reg. To Date",
    type: "date",
  },

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
    key: "branch-spacer",
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
  // {
  //   key: "notInBatch",
  //   label: "",
  //   type: "checkbox",
  //   wrapperClassName: "pt-5",
  //   options: [
  //     {
  //       label: "Not in any batch",
  //       value: true,
  //     },
  //   ],
  // },
];
