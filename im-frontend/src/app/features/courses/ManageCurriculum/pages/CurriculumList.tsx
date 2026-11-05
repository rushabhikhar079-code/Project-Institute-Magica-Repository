import { useDispatch, useSelector } from "react-redux";
import { Landmark, Plus } from "lucide-react";
import type { RootState } from "../../../../redux/store";
import SearchFilter from "../../../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../../../components/common/DataTable/Datatable";

import { getCurriculumColumns } from "../columns";
import type { CurriculumList } from "../types";
import type { FilterField } from "../../../../components/common/SearchFilter/types";
import Pagination from "../../../../components/common/DataTable/TablePagination";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useEffect } from "react";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";

type Props = {
  curriculums: CurriculumList[];
  fields: FilterField[];

  searchValue: string;
  filterValues: Record<string, any>;

  openAdd: () => void;
  openaddFromInst: () => void;
  openexpToBranch: () => void;
  onEdit: (curriculum: CurriculumList) => void;
  onDelete: (id: number) => void;

  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: any) => void;
  onSearch: () => void;
  onClear: () => void;

  setCurrentPage: (page: string) => void;
  setSelectedCurriculum: (curriculum: string) => void;
  // Table pagination
  currentTablePage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy: string | null;

  sortDirection: "asc" | "desc" | null;

  onSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => void;
};

const CurriculumList = ({
  curriculums,
  fields,
  openAdd,
  openaddFromInst,
  openexpToBranch,
  onEdit,
  onDelete,
  searchValue,
  filterValues,
  onSearchChange,
  onFilterChange,
  onSearch,
  onClear,
  setCurrentPage,
  setSelectedCurriculum,
  currentTablePage,
  pageSize,
  totalCount,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDirection,
  onSortChange,
}: Props) => {
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  console.log("Redux branchId:", branchId);
  const columns = getCurriculumColumns({
    onEdit,
    onDelete,
  });

  console.log("curriculums", curriculums);

  console.log(columns);
  return (
    <div>
      <SearchFilter
        searchValue={searchValue}
        searchPlaceholder="Search curriculums by name..."
        onSearchChange={onSearchChange}
        fields={fields}
        values={filterValues}
        onValueChange={onFilterChange}
        onSearch={onSearch}
        onClear={onClear}
      />

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Curriculum</span>
          </button>
          {branchId !== 0 && (
            <button
              onClick={openaddFromInst}
              className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Import Curriculums From Institute</span>
            </button>
          )}
          {branchId == 0 && (
            <button
              onClick={openexpToBranch}
              className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Export Curriculums to Branches</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={curriculums}
            rowKey="CurriculumId"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            onRowClick={(curriculum) => {
              setSelectedCurriculum(curriculum.CurriculumName);
              setCurrentPage("manageStudents");
            }}
            emptyMessage="No Curriculums found."
          />
          {totalCount > 0 && (
            <Pagination
              currentPage={currentTablePage}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </div>
        {branchId !== 0 && (
          <div className="flex items-center gap-2 pl-4">
            <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center flex-shrink-0">
              <Landmark className="w-3.5 h-3.5 text-[#0F4C81]" />
            </div>

            <span className="text-sm text-gray-600">
              - Curriculums imported from institute.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurriculumList;
