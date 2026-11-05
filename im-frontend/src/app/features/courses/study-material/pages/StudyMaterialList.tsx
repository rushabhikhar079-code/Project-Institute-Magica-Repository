import { Button } from "../../../../components/common/Button";
import SearchFilter from "../../../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";
import { getStudyMaterialColumns } from "../columns";
import type { FilterField } from "../../../../components/common/SearchFilter/types";
import type {
  StudyMaterialDto,
  StudyMaterialSearchDto,
} from "../studyMaterialTypes";
import { Paperclip, Plus } from "lucide-react";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";

type Props = {
  loading?: boolean;
  fields: FilterField[];
  materials: StudyMaterialDto[];
  searchValue: string;
  filterValues: StudyMaterialSearchDto;
  errors?: Record<string, string>;
  openexpToBranch: () => void;
  openInstituteStudyMaterial: () => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: any) => void;
  onSearch: () => void;
  onClear: () => void;
  openAdd?: () => void;
  onEdit: (material: StudyMaterialDto) => void;
  onDelete: (id: number) => void;
  currentTablePage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  sortBy: string | null;
  sortDirection: "asc" | "desc" | null;

  onSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => void;
};

const StudyMaterialList = ({
  loading = false,
  fields,
  materials,
  searchValue,
  filterValues,
  errors,
  openexpToBranch,
  openInstituteStudyMaterial,
  onSearchChange,
  onFilterChange,
  onSearch,
  onClear,
  openAdd,
  onEdit,
  onDelete,
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
  const handleDeleteWithConfirmation = (id: number) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this Study Material?",
    );
    if (isConfirmed) {
      onDelete(id);
    }
  };

  const columns = getStudyMaterialColumns({
    onEdit,
    onDelete: handleDeleteWithConfirmation,
  });
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  return (
    <div>
      {/* Search & Advanced Filters */}
      <SearchFilter
        searchKey="studyMaterialHeading"
        fields={fields}
        searchValue={searchValue}
        searchPlaceholder="Study Material Name..."
        onSearchChange={onSearchChange}
        values={filterValues}
        errors={errors}
        onValueChange={onFilterChange}
        onSearch={onSearch}
        onClear={onClear}
      />

      {/* Add Button Section */}
      {openAdd && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
          <div className="flex gap-3">
            <Button preset="add" onClick={openAdd}>
              Add Study Material
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={materials}
            rowKey="studymaterialId"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            emptyMessage="No study materials found."
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
        <div className="flex items-center gap-2 pl-4">
          <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center flex-shrink-0">
            <Paperclip className="w-3.5 h-3.5 text-[#0F4C81]" />
          </div>

          <span className="text-sm text-gray-600">
            - Study Material has file attached.
          </span>
        </div>
      </div>
    </div>
  );
};
export default StudyMaterialList;
