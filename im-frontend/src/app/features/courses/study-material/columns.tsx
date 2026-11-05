import { Edit, Paperclip, Trash2, Check } from "lucide-react";
import { TableColumn } from "../../../components/common/DataTable";
import type { StudyMaterialDto } from "./studyMaterialTypes";

type ColumnProps = {
  onEdit: (material: StudyMaterialDto) => void;
  onDelete: (id: number) => void;
};

export const getStudyMaterialColumns = ({
  onEdit,
  onDelete,
}: ColumnProps): TableColumn<StudyMaterialDto>[] => [
  {
    key: "actions",
    header: "ACTIONS",
    align: "center",
    width: "120px",
    render: (row) => (
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          className="p-1.5 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors cursor-pointer"
          title="Edit Material"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (row?.studymaterialId) {
              onDelete(row.studymaterialId);
            }
          }}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Delete Material"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    ),
  },
  {
    key: "heading",
    header: "STUDY MATERIAL TITLE",
    sortable: true,
    sortKey: "StudyMaterialHeading",
    render: (row) => (
      <div className="flex items-center gap-2">
        <span>{row.heading}</span>

        {row.attachmentOriginalName?.trim() && (
          <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center flex-shrink-0">
            <Paperclip className="w-3.5 h-3.5 text-[#0F4C81]" />
          </div>
        )}
      </div>
    ),
  },
  {
    key: "curriculum_Name",
    header: "Curriculum Name",
    render: (row) => <p>{row.curriculumName || "-"}</p>,
  },
  {
    key: "courseName",
    header: "COURSE NAME",
    render: (row) => <span>{row.courseName}</span>,
  },
  {
    key: "subjectName",
    header: "SUBJECT NAME",
    render: (row) => <span>{row.subjectName}</span>,
  },
  {
    key: "topicName",
    header: "TOPIC NAME",
    render: (row) => <span>{row.topicName}</span>,
  },
  {
    key: "isActive",
    header: "STATUS",
    align: "center",
    render: (row) => {
      const rawStatus = row?.isActive as any;

      const isActive =
        rawStatus === 1 || rawStatus === true || rawStatus === "1";

      return (
        <span
          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
];

type InstituteStudyMaterialColumnProps = {
  selectedStudyMaterialIds: number[];
  studyMaterials: StudyMaterialDto[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getInstituteStudyMaterialColumns = ({
  selectedStudyMaterialIds,
  studyMaterials,
  onSelect,
  onSelectAll,
}: InstituteStudyMaterialColumnProps): TableColumn<StudyMaterialDto>[] => [
  {
    key: "select",
    header: (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={
            studyMaterials.length > 0 &&
            studyMaterials.every((material) =>
              selectedStudyMaterialIds.includes(material.studymaterialId),
            )
          }
          onChange={onSelectAll}
          className="w-4 h-4 cursor-pointer accent-[#0F4C81]"
        />{" "}
        <span>Select All</span>
      </div>
    ),
    align: "center",
    width: "60px",
    render: (row) => {
      const isSelected = selectedStudyMaterialIds.includes(row.studymaterialId);

      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(row.studymaterialId)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer accent-[#0F4C81]"
          />
        </div>
      );
    },
  },
  {
    key: "heading",
    header: "STUDY MATERIAL TITLE",
    sortable: true,
    sortKey: "StudyMaterialHeading",
    render: (row) => (
      <div className="flex items-center gap-2">
        <span>{row.heading}</span>

        {row.attachmentOriginalName?.trim() && (
          <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center flex-shrink-0">
            <Paperclip className="w-3.5 h-3.5 text-[#0F4C81]" />
          </div>
        )}
      </div>
    ),
  },
  {
    key: "curriculum_Name",
    header: "Curriculum Name",
    render: (row) => <p>{row.curriculumName || "-"}</p>,
  },
  {
    key: "courseName",
    header: "COURSE NAME",
    render: (row) => <span>{row.courseName}</span>,
  },
  {
    key: "subjectName",
    header: "SUBJECT NAME",
    render: (row) => <span>{row.subjectName}</span>,
  },
  {
    key: "topicName",
    header: "TOPIC NAME",
    render: (row) => <span>{row.topicName}</span>,
  },
  {
    key: "isActive",
    header: "STATUS",
    align: "center",
    render: (row) => {
      const rawStatus = row?.isActive as any;

      const isActive =
        rawStatus === 1 || rawStatus === true || rawStatus === "1";

      return (
        <span
          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
];
