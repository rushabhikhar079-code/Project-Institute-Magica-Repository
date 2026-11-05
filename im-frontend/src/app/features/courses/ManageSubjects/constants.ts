import { FilterField } from "../../../components/common/SearchFilter/types";

export const inp =
  "w-full h-[40px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] text-sm bg-white transition-all placeholder:text-gray-400";

export const lbl = "block text-sm font-medium text-gray-700 mb-1.5";

export const getFields = (
  courseOptions: {
    label: string;
    value: string | number;
  }[],
  curriculumOptions: {
    label: string;
    value: string | number;
  }[],
): FilterField[] => [
  {
    key: "curriculumId",
    label: "Curriculum Name",
    type: "select",
    placeholder: "Curriculum Name",
    options: curriculumOptions,
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

      const startsWithNumberA = /^\d/.test(nameA);
      const startsWithNumberB = /^\d/.test(nameB);

      if (startsWithNumberA && !startsWithNumberB) return -1;
      if (!startsWithNumberA && startsWithNumberB) return 1;

      if (startsWithNumberA && startsWithNumberB) {
        const firstDigitA = Number(nameA.charAt(0));
        const firstDigitB = Number(nameB.charAt(0));

        if (firstDigitA !== firstDigitB) {
          return firstDigitA - firstDigitB;
        }

        return nameA.localeCompare(nameB, undefined, {
          sensitivity: "base",
        });
      }

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
