import { Building2, Edit, Landmark, Trash2 } from "lucide-react";
import { TableColumn } from "../../../components/common/DataTable";
import type {
  CourseList,
  InstituteCourses,
  InstituteSubjectApi,
} from "./types";

type ColumnProps = {
  onEdit: (course: CourseList) => void;
  onDelete: (id: number) => void;
};

export const getCourseColumns = ({
  onEdit,
  onDelete,
}: ColumnProps): TableColumn<CourseList>[] => [
  {
    key: "actions",
    header: "Actions",
    align: "center",
    width: "120px",
    render: (course) => (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(course);
          }}
          className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Edit Course"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(course.courseId);
          }}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Course"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    ),
  },
  {
    key: "curriculum_Name",
    header: "Curriculum Name",
    render: (course) => <p>{course.curriculum_Name || "-"}</p>,
  },

  {
    key: "course_Name",
    header: "Course Name",
    sortable: true,
    sortKey: "CourseName",
    render: (course) => (
      <div className="flex items-center gap-3">
        <p>{course.course_Name}</p>{" "}
        <div className="w-6 h-6 flex items-center justify-center">
          {course.isImported && (
            <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center">
              <Landmark className="w-3.5 h-3.5 text-[#0F4C81]" />
            </div>
          )}
        </div>
      </div>
    ),
  },

  {
    key: "courseFees",
    header: "Course Fees",
    render: (course) => <p>{course.courseFees}</p>,
  },

  {
    key: "courseType",
    header: "Type",
    render: (course) => <p>{course.courseType || "-"}</p>,
  },

  {
    key: "hsncode",
    header: "HSNCODE",
    render: (course) => <p>{course.hsncode || "-"}</p>,
  },

  {
    key: "cTaxable",
    header: "Taxable",
    render: (course) => <p>{course.cTaxable ? "Yes" : "No"}</p>,
  },

  {
    key: "cIncluding_Tax",
    header: "Tax Type",
    render: (course) => (
      <p>
        {course.cTaxable
          ? course.cIncluding_Tax
            ? "Including Tax"
            : "Excluding Tax"
          : "-"}
      </p>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (course) => (
      <span
        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
          course.status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {course.status}
      </span>
    ),
  },
];

type InstituteColumnProps = {
  selectedCourseIds: number[];
  courses: InstituteCourses[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getInstituteCourseColumns = ({
  selectedCourseIds,
  courses,
  onSelect,
  onSelectAll,
}: InstituteColumnProps): TableColumn<InstituteCourses>[] => {
  const isImported = (course: InstituteCourses) => {
    const value = course.isImported;

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value === 1;
    }

    return String(value).toLowerCase() === "true";
  };

  const selectableCourses = courses.filter((course) => !isImported(course));

  const allSelected =
    selectableCourses.length > 0 &&
    selectableCourses.every((course) =>
      selectedCourseIds.includes(course.courseId),
    );

  return [
    {
      key: "select",

      header: (
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            disabled={selectableCourses.length === 0}
            className="h-4 w-4 cursor-pointer accent-[#0F4C81] disabled:cursor-not-allowed"
          />

          <span>Select All</span>
        </div>
      ),
      align: "center",
      width: "120px",

      render: (course) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedCourseIds.includes(course.courseId)}
            onChange={() => onSelect(course.courseId)}
            onClick={(e) => e.stopPropagation()}
            disabled={isImported(course)}
            className="h-4 w-4 cursor-pointer accent-[#0F4C81] disabled:cursor-not-allowed"
          />
        </div>
      ),
    },

    {
      key: "curriculum_Name",
      header: "Curriculum Name",
      render: (course) => <span>{course.curriculum_Name || "-"}</span>,
    },
    {
      key: "course_Name",
      header: "Course Name",
      sortable: true,
      sortKey: "CourseName",
      render: (course) => <span>{course.course_Name || "-"}</span>,
    },

    {
      key: "duration",
      header: "Duration",
      render: (course) => <span>{course.duration || "-"}</span>,
    },
  ];
};
export const getInstituteSubjectColumns =
  (): TableColumn<InstituteSubjectApi>[] => [
    {
      key: "curriculum_Name",
      header: "Curriculum Name",
      render: (subject) => <span>{subject.curriculum_Name || "-"}</span>,
    },

    {
      key: "course_Name",
      header: "Course Name",
      render: (subject) => <span>{subject.course_Name || "-"}</span>,
    },

    {
      key: "sub_Name",
      header: "Subject Name",
      render: (subject) => <span>{subject.sub_Name || "-"}</span>,
    },

    {
      key: "durationFull",
      header: "Duration",
      render: (subject) => <span>{subject.durationFull || "-"}</span>,
    },

    {
      key: "actualFees",
      header: "Fees",
      render: (subject) => (
        <span>{Number(subject.actualFees || 0).toLocaleString("en-IN")}</span>
      ),
    },

    {
      key: "subjectType",
      header: "Fee Type",
      render: (subject) => <span>{subject.subjectType || "-"}</span>,
    },
  ];
type ExportCourseColumnProps = {
  selectedCourseIds: number[];
  courses: CourseList[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getExportCourseColumns = ({
  selectedCourseIds,
  courses,
  onSelect,
  onSelectAll,
}: ExportCourseColumnProps): TableColumn<CourseList>[] => {
  const isImported = (course: CourseList) => {
    const value = course.isImported;

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value === 1;
    }

    return String(value).toLowerCase() === "true";
  };

  const selectableCourses = courses.filter((course) => !isImported(course));

  const allSelected =
    selectableCourses.length > 0 &&
    selectableCourses.every((course) =>
      selectedCourseIds.includes(course.courseId),
    );

  return [
    {
      key: "select",
      header: (
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            disabled={selectableCourses.length === 0}
            className="h-4 w-4 cursor-pointer accent-[#0F4C81] disabled:cursor-not-allowed"
          />

          <span>Select All</span>
        </div>
      ),
      align: "center",
      width: "120px",

      render: (course) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedCourseIds.includes(course.courseId)}
            onChange={() => onSelect(course.courseId)}
            onClick={(e) => e.stopPropagation()}
            disabled={isImported(course)}
            className="h-4 w-4 cursor-pointer accent-[#0F4C81] disabled:cursor-not-allowed"
          />
        </div>
      ),
    },

    {
      key: "curriculum_Name",
      header: "Curriculum Name",
      render: (course) => <p>{course.curriculum_Name || "-"}</p>,
    },

    {
      key: "course_Name",
      header: "Course Name",
      sortable: true,
      sortKey: "CourseName",
      render: (course) => (
        <div className="flex items-center gap-3">
          <p>{course.course_Name}</p>

          <div className="w-6 h-6 flex items-center justify-center"></div>
        </div>
      ),
    },

    {
      key: "courseFees",
      header: "Course Fees",
      render: (course) => <p>{course.courseFees}</p>,
    },

    {
      key: "courseType",
      header: "Type",
      render: (course) => <p>{course.courseType || "-"}</p>,
    },

    {
      key: "hsncode",
      header: "HSNCODE",
      render: (course) => <p>{course.hsncode || "-"}</p>,
    },

    {
      key: "cTaxable",
      header: "Taxable",
      render: (course) => <p>{course.cTaxable ? "Yes" : "No"}</p>,
    },

    {
      key: "cIncluding_Tax",
      header: "Tax Type",
      render: (course) => (
        <p>
          {course.cTaxable
            ? course.cIncluding_Tax
              ? "Including Tax"
              : "Excluding Tax"
            : "-"}
        </p>
      ),
    },
  ];
};
