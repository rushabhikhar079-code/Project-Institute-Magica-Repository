import { useState } from "react";
import { Building2, Network, Plus, School } from "lucide-react";

import SearchFilter from "../../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../../components/common/DataTable/Datatable";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store";
import { setBranchId } from "../../../redux/slices/branchSlice";
import { getBranchColumns } from "../columns";
import type { BranchList } from "../branchTypes";
import type { FilterField } from "../../../components/common/SearchFilter/types";
import Pagination from "../../../components/common/DataTable/TablePagination";
import { branchSearchSchema } from "../validations/BranchSearchSchema";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";

type Props = {
  branches: BranchList[];
  fields: FilterField[];

  searchValue: string;
  filterValues: Record<string, any>;

  openAdd: () => void;
  onEdit: (branch: BranchList) => void;
  onDelete: (id: number) => void;

  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: any) => void;
  onSearch: () => void;
  onClear: () => void;

  setCurrentPage: (page: string) => void;
  setSelectedBranch: (branch: string) => void;
  // Table pagination
  currentTablePage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  // Sorting
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;

  onSortChange?: (
    sortKey: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => void;
};

const BranchList = ({
  branches,
  fields,
  openAdd,
  onEdit,
  onDelete,
  searchValue,
  filterValues,
  onSearchChange,
  onFilterChange,
  onSearch,
  onClear,
  setCurrentPage,
  setSelectedBranch,
  // Table pagination
  currentTablePage,
  pageSize,
  totalCount,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
  onPageSizeChange,
  // Sorting
  sortBy,
  sortDirection,
  onSortChange,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const columns = getBranchColumns({
    onEdit,
    onDelete,
  });
  console.log("branches", branches);

  console.log(columns);
  const branchId = useSelector((state: RootState) => state.branch.branchId);

  console.log("Redux branchId:", branchId);
  return (
    <div>
      <SearchFilter
        searchValue={searchValue}
        searchPlaceholder="Search branches by name or location..."
        onSearchChange={onSearchChange}
        fields={fields}
        values={filterValues}
        onValueChange={onFilterChange}
        onSearch={onSearch}
        onClear={onClear}
        validationSchema={branchSearchSchema}
      />

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={branches}
            rowKey="branchId"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            onRowClick={(branch) => {
              console.log("Selected Branch ID:", branch.branchId);
              dispatch(setBranchId(branch.branchId));
              setSelectedBranch(branch.branchName);
              setCurrentPage("manageStudents");
            }}
            emptyMessage="No branches found."
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
            <School className="w-3.5 h-3.5 text-[#0F4C81]" />
          </div>

          <span className="text-sm text-gray-600">- Branch</span>
          <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-3.5 h-3.5 text-[#0F4C81]" />
          </div>

          <span className="text-sm text-gray-600">
            - Franchisee level branch
          </span>
        </div>
      </div>
    </div>
  );
};

export default BranchList;
