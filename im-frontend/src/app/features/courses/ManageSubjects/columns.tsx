import { Building2, Edit, Landmark, Trash2 } from "lucide-react";
import { TableColumn } from "../../../components/common/DataTable";
import type { InstituteSubjects, SubjectList } from "./types";

type ColumnProps = {
  onEdit: (course: SubjectList) => void;
  onDelete: (id: number) => void;
};

export const getSubjectColumns = ({
  onEdit,
  onDelete,
}: ColumnProps): TableColumn<SubjectList>[] => [
  {
    key: "actions",
    header: "Actions",
    align: "center",
    width: "120px",
    render: (subject) => {
      const isSessionWise = subject.subjectType === "Sessionwise";

      return (
        <div className="flex items-center justify-center gap-2">
          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isSessionWise) {
                onEdit(subject);
              }
            }}
            disabled={isSessionWise}
            className={`p-2 rounded-lg transition-colors ${
              isSessionWise
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#0F4C81] hover:bg-[#e0eef5]"
            }`}
            title={
              isSessionWise
                ? "This subject cannot be edited because the fees type is set to Sessionwise."
                : "Edit subject"
            }
          >
            <Edit className="w-5 h-5" />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isSessionWise) {
                onDelete(subject.subId);
              }
            }}
            disabled={isSessionWise}
            className={`p-2 rounded-lg transition-colors ${
              isSessionWise
                ? "text-gray-400 cursor-not-allowed"
                : "text-red-500 hover:bg-red-50"
            }`}
            title={
              isSessionWise
                ? "This subject cannot be deleted because the fees type is set to Sessionwise."
                : "Delete subject"
            }
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      );
    },
  },
  {
    key: "curriculum_Name",
    header: "Curriculum Name",
    render: (subject) => <p>{subject.curriculumName || "-"}</p>,
  },
  {
    key: "courseName",
    header: "Course Name",

    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.courseName}</p>
        </div>
      </div>
    ),
  },
  {
    key: "subName",
    header: "Subject Name",
    sortable: true,
    sortKey: "SubjectName",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <p>{subject.subName}</p>{" "}
        <div className="w-6 h-6 flex items-center justify-center">
          {subject.isImported && (
            <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center">
              <Landmark className="w-3.5 h-3.5 text-[#0F4C81]" />
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "Fees",

    header: "Fees",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.actualFees}</p>
        </div>
      </div>
    ),
  },
  {
    key: "subjectType", // Fixed from "type"
    header: "Fees Type",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.subjectType}</p>
        </div>
      </div>
    ),
  },
  {
    key: "taxable",
    header: "Taxable",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.taxable}</p>
        </div>
      </div>
    ),
  },
  {
    key: "taxType", // Fixed from "taxtype"
    header: "Tax Type",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.taxType}</p>
        </div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (subject) => (
      <span
        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
          subject.status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {subject.status}
      </span>
    ),
  },
];

type InstituteColumnProps = {
  selectedSubjectIds: number[];
  subjects: InstituteSubjects[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getInstituteSubjectColumns = ({
  selectedSubjectIds,
  subjects,
  onSelect,
  onSelectAll,
}: InstituteColumnProps): TableColumn<InstituteSubjects>[] => {
  return [
    {
      key: "select",
      header: (
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            onChange={onSelectAll}
            className="w-4 h-4 accent-[#0F4C81] cursor-pointer disabled:cursor-not-allowed"
          />
          <span>Select All</span>
        </div>
      ),
      align: "center",
      width: "120px",

      render: (subject) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedSubjectIds.includes(subject.subId)}
            onChange={() => onSelect(subject.subId)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 accent-[#0F4C81] cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      ),
    },
    {
      key: "courseName",
      header: "Course Name",
      render: (subject) => <span>{subject.courseName || "-"}</span>,
    },
    {
      key: "subName",
      header: "Subject Name",
      sortable: true,
      sortKey: "SubjectName",
      render: (subject) => (
        <div className="flex items-center gap-3">
          <span>{subject.subName}</span>
        </div>
      ),
    },

    {
      key: "durationFull",
      header: "Duration",
      render: (subject) => <span>{subject.durationFull || "-"}</span>,
    },
    {
      key: "actualFees",
      header: "Fees",
      render: (subject) => <span>{subject.actualFees || "-"}</span>,
    },
  ];
};
type ExportSubjectColumnProps = {
  selectedSubjectIds: number[];
  subjects: SubjectList[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getExportSubjectColumns = ({
  selectedSubjectIds,
  subjects,
  onSelect,
  onSelectAll,
}: ExportSubjectColumnProps): TableColumn<SubjectList>[] => [
  {
    key: "select",
    header: (
      <div className="flex items-center justify-center gap-2">
        <input
          type="checkbox"
          checked={
            subjects.length > 0 &&
            subjects.every((subject) =>
              selectedSubjectIds.includes(subject.subId),
            )
          }
          onChange={onSelectAll}
          className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
        />
        <span>Select All</span>
      </div>
    ),
    align: "center",
    width: "120px",
    render: (subject) => (
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={selectedSubjectIds.includes(subject.subId)}
          onChange={() => onSelect(subject.subId)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
        />
      </div>
    ),
  },

  {
    key: "curriculum_Name",
    header: "Curriculum Name",
    render: (subject) => <p>{subject.curriculumName || "-"}</p>,
  },

  {
    key: "courseName",
    header: "Course Name",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.courseName}</p>
        </div>
      </div>
    ),
  },

  {
    key: "subName",
    header: "Subject Name",
    sortable: true,
    sortKey: "SubjectName",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <p>{subject.subName}</p>

        <div className="w-6 h-6 flex items-center justify-center"></div>
      </div>
    ),
  },

  {
    key: "Fees",
    header: "Fees",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.actualFees}</p>
        </div>
      </div>
    ),
  },

  {
    key: "subjectType",
    header: "Fees Type",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.subjectType}</p>
        </div>
      </div>
    ),
  },

  {
    key: "taxable",
    header: "Taxable",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.taxable}</p>
        </div>
      </div>
    ),
  },

  {
    key: "taxType",
    header: "Tax Type",
    render: (subject) => (
      <div className="flex items-center gap-3">
        <div>
          <p>{subject.taxType}</p>
        </div>
      </div>
    ),
  },
];
