import {
  Building,
  Building2,
  Edit,
  Info,
  Landmark,
  Star,
  Trash2,
} from "lucide-react";
import { TableColumn } from "../../../components/common/DataTable";
import type { CurriculumList, InstituteCurriculum } from "./types";
type ColumnProps = {
  onEdit: (curriculum: CurriculumList) => void;
  onDelete: (id: number) => void;
};

export const getCurriculumColumns = ({
  onEdit,
  onDelete,
}: ColumnProps): TableColumn<CurriculumList>[] => [
  {
    key: "actions",
    header: "Actions",
    align: "center",
    width: "120px",
    render: (curriculum) => (
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(curriculum);
          }}
          className="p-1.5 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Edit Curriculum"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(curriculum.CurriculumId);
          }}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Curriculum"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    ),
  },
  {
    key: "curriculumName",
    header: "Curriculum Name",
    sortable: true,
    sortKey: "CurriculumName",
    render: (curriculum) => (
      <div className="flex items-center gap-3">
        <p>{curriculum.CurriculumName}</p>{" "}
        <div className="w-6 h-6 flex items-center justify-center">
          {curriculum.isImported && (
            <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center">
              <Landmark className="w-3.5 h-3.5 text-[#0F4C81]" />
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (curriculum) => (
      <span
        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
          curriculum.Status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {curriculum.Status}
      </span>
    ),
  },
];

type InstituteColumnProps = {
  selectedCurriculumIds: number[];
  curriculums: InstituteCurriculum[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getInstituteCurriculumColumns = ({
  selectedCurriculumIds,
  curriculums,
  onSelect,
  onSelectAll,
}: InstituteColumnProps): TableColumn<InstituteCurriculum>[] => {
  const selectableCurriculums = curriculums.filter(
    (curriculum) => !curriculum.isImported,
  );

  const allSelected =
    selectableCurriculums.length > 0 &&
    selectableCurriculums.every((curriculum) =>
      selectedCurriculumIds.includes(curriculum.crclmId),
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
            disabled={selectableCurriculums.length === 0}
            className="w-4 h-4 accent-[#0F4C81] cursor-pointer disabled:cursor-not-allowed"
          />
          <span>Select All</span>
        </div>
      ),
      align: "center",
      width: "120px",

      render: (curriculum) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedCurriculumIds.includes(curriculum.crclmId)}
            onChange={() => onSelect(curriculum.crclmId)}
            onClick={(e) => e.stopPropagation()}
            disabled={curriculum.isImported}
            className="w-4 h-4 accent-[#0F4C81] cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      ),
    },

    {
      key: "curriculumName",
      header: "Curriculum Name",
      sortable: true,
      sortKey: "CurriculumName",
      render: (curriculum) => (
        <div className="flex items-center gap-3">
          <span>{curriculum.crclmName}</span>
        </div>
      ),
    },

    {
      key: "description",
      header: "Description",
      className: "w-[600px] max-w-[600px] whitespace-normal",
      render: (curriculum) => (
        <div className="whitespace-normal break-words">
          {curriculum.crclmDesc || "-"}
        </div>
      ),
    },
  ];
};
type ExportCurriculumColumnProps = {
  selectedCurriculumIds: number[];
  curriculums: CurriculumList[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getExportCurriculumColumns = ({
  selectedCurriculumIds,
  curriculums,
  onSelect,
  onSelectAll,
}: ExportCurriculumColumnProps): TableColumn<CurriculumList>[] => {
  const allSelected =
    curriculums.length > 0 &&
    curriculums.every((curriculum) =>
      selectedCurriculumIds.includes(curriculum.CurriculumId),
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
            disabled={curriculums.length === 0}
            className="w-4 h-4 accent-[#0F4C81] cursor-pointer disabled:cursor-not-allowed"
          />
          <span>Select All</span>
        </div>
      ),
      align: "center",
      width: "120px",
      render: (curriculum) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedCurriculumIds.includes(curriculum.CurriculumId)}
            onChange={() => onSelect(curriculum.CurriculumId)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
          />
        </div>
      ),
    },

    {
      key: "curriculumName",
      header: "Curriculum Name",
      sortable: true,
      sortKey: "CurriculumName",
      render: (curriculum) => (
        <div className="flex items-center gap-3">
          <p>{curriculum.CurriculumName}</p>

          <div className="w-6 h-6 flex items-center justify-center">
            {curriculum.isImported && (
              <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center">
                <Landmark className="w-3.5 h-3.5 text-[#0F4C81]" />
              </div>
            )}
          </div>
        </div>
      ),
    },

    {
      key: "status",
      header: "Status",
      align: "center",
      render: (curriculum) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
            curriculum.Status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {curriculum.Status}
        </span>
      ),
    },
  ];
};
