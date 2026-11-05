import type { FilterField } from "../../../components/common/SearchFilter/types";

export const studyMaterialFilterFields: FilterField[] = [
  {
    key: "crclmId",
    label: "Curriculum Name",
    type: "select",
  },
  {
    key: "courseId",
    label: "Course Name",
    type: "select",
  },
  {
    key: "subjectId",
    label: "Subject Name",
    type: "select",
  },
  {
    key: "topicId",
    label: "Topic Name",
    type: "select",
    disabled: true,
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
];
