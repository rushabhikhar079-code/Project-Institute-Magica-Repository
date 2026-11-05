import { FilterField } from "../../../components/common/SearchFilter/types";

export const inp =
  "w-full h-[40px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] text-sm bg-white transition-all placeholder:text-gray-400";

export const lbl = "block text-sm font-medium text-gray-700 mb-1.5";

export const getFields = (
  curriculumOptions: {
    label: string;
    value: string | number;
  }[],
  courseOptions: {
    label: string;
    value: string | number;
  }[],
  subjectOptions: {
    label: string;
    value: string | number;
  }[],
): FilterField[] => [
  {
    key: "curriculumId",
    label: "Curriculum Name",
    type: "select",
    placeholder: "Curriculum Name",
    options: [...curriculumOptions].sort((a, b) => {
      const nameA = a.label.trim();
      const nameB = b.label.trim();

      const isNumberA = /^\d/.test(nameA);
      const isNumberB = /^\d/.test(nameB);

      // Numbers first
      if (isNumberA && !isNumberB) return -1;
      if (!isNumberA && isNumberB) return 1;

      // Both start with numbers → compare ONLY first digit
      if (isNumberA && isNumberB) {
        const digitA = Number(nameA[0]);
        const digitB = Number(nameB[0]);

        if (digitA !== digitB) {
          return digitA - digitB;
        }

        return nameA.localeCompare(nameB, undefined, {
          sensitivity: "base",
        });
      }

      // Both start with letters → A-Z
      return nameA.localeCompare(nameB, undefined, {
        sensitivity: "base",
      });
    }),
    className:
      "w-full h-[40px] px-3 flex items-center justify-between rounded-[10px] text-sm bg-white border transition-colors focus:outline-none",
  },
  {
    key: "course",
    label: "Course Name",
    type: "select",
    placeholder: "Course Name",
    options: [...courseOptions].sort((a, b) => {
      const nameA = a.label.trim();
      const nameB = b.label.trim();

      const isNumberA = /^\d/.test(nameA);
      const isNumberB = /^\d/.test(nameB);

      // Numbers first
      if (isNumberA && !isNumberB) return -1;
      if (!isNumberA && isNumberB) return 1;

      // Both start with numbers → compare ONLY first digit
      if (isNumberA && isNumberB) {
        const digitA = Number(nameA[0]);
        const digitB = Number(nameB[0]);

        if (digitA !== digitB) {
          return digitA - digitB;
        }

        // Same first digit
        return nameA.localeCompare(nameB, undefined, {
          sensitivity: "base",
        });
      }

      // Both start with letters → A-Z
      return nameA.localeCompare(nameB, undefined, {
        sensitivity: "base",
      });
    }),
    className:
      "w-full h-[40px] px-3 flex items-center justify-between rounded-[10px] text-sm bg-white border transition-colors focus:outline-none",
  },
  {
    key: "subject",
    label: "Subject Name",
    type: "select",
    placeholder: "Subject Name",
    options: [...subjectOptions].sort((a, b) => {
      const nameA = a.label.trim();
      const nameB = b.label.trim();

      const isNumberA = /^\d/.test(nameA);
      const isNumberB = /^\d/.test(nameB);

      // Numbers first
      if (isNumberA && !isNumberB) return -1;
      if (!isNumberA && isNumberB) return 1;

      // Both start with numbers → compare ONLY first digit
      if (isNumberA && isNumberB) {
        const digitA = Number(nameA[0]);
        const digitB = Number(nameB[0]);

        if (digitA !== digitB) {
          return digitA - digitB;
        }

        // Same first digit → alphabetical
        return nameA.localeCompare(nameB, undefined, {
          sensitivity: "base",
        });
      }

      // Both start with letters → A-Z
      return nameA.localeCompare(nameB, undefined, {
        sensitivity: "base",
      });
    }),
    className:
      "w-full h-[40px] px-3 flex items-center justify-between rounded-[10px] text-sm bg-white border transition-colors focus:outline-none",
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
export const TOPIC_DURATION_OPTIONS = [
  { label: "Hours", value: 1 },
  { label: "Days", value: 2 },
  { label: "Months", value: 3 },
];
