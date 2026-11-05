// import { Plus } from "lucide-react";

// import SearchFilter from "../../../components/common/SearchFilter/SearchFilter";
// import DataTable from "../../../components/common/DataTable/Datatable";
// import Pagination from "../../../components/common/DataTable/TablePagination";

// import { getInstituteColumns } from "../columns";
// // 🎯 Import type for FilterField
// import type { FilterField } from "../../../components/common/SearchFilter/types";

// import type {
//   InstituteListType,
//   InstituteFilterState,
// } from "../institutetypes";
// import { Button } from "../../../components/common/Button";
// type Props = {
//   fields: FilterField[]; // 👈 Changed to fields to match parent standard
//   institutes: InstituteListType[];
//   searchValue: string;
//   filterValues: InstituteFilterState;
//   errors?: Record<string, string>;
//   onSearchChange: (value: string) => void;
//   onFilterChange: (key: string, value: any) => void;
//   onSearch: () => void;
//   onClear: () => void;

//   // Actions
//   openAdd?: () => void;
//   onEdit: (institute: InstituteListType) => void;
//   onDelete: (id: number) => void;
//   onSelectInstitute?: (institute: InstituteListType) => void;

//   // Pagination
//   currentTablePage: number;
//   pageSize: number;
//   totalCount: number;
//   totalPages: number;
//   hasPrevious: boolean;
//   hasNext: boolean;
//   onPageChange: (page: number) => void;
//   onPageSizeChange: (newPageSize: number) => void;
// };

// const InstituteList = ({
//   fields, // 👈 Destructure fields
//   institutes,
//   searchValue,
//   filterValues,
//   errors,
//   onSearchChange,
//   onFilterChange,
//   onSearch,
//   onClear,
//   openAdd,
//   onEdit,
//   onDelete,
//   onSelectInstitute,
//   currentTablePage,
//   pageSize,
//   totalCount,
//   totalPages,
//   hasPrevious,
//   hasNext,
//   onPageChange,
//   onPageSizeChange,
// }: Props) => {
//   const handleDeleteWithConfirmation = (id: number) => {
//     const isConfirmed = window.confirm(
//       "Are you sure you want to delete this institute? This action cannot be undone.",
//     );
//     if (isConfirmed) {
//       onDelete(id);
//     }
//   };
//   const columns = getInstituteColumns({
//     onEdit,
//     onDelete: handleDeleteWithConfirmation,
//     onSelectInstitute,
//   });

//   return (
//     <div>
//       {/* Search & Advanced Filters */}
//       <SearchFilter
//         searchKey="instituteName"
//         fields={fields} // 👈 🎯 Only pass 'fields' with the dynamic array from props!
//         searchValue={searchValue}
//         searchPlaceholder="Search institute by name..."
//         onSearchChange={onSearchChange}
//         values={filterValues}
//         errors={errors}
//         onValueChange={onFilterChange}
//         onSearch={onSearch}
//         onClear={onClear}
//       />

//       {/* Add Button */}
//       {/* {openAdd && (
//         <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
//           <div className="flex gap-3">
//             <Button preset="add" onClick={openAdd}>
//               Add Institute
//             </Button>
//           </div>
//         </div>
//       )} */}

//       {/* Data Table */}
//       <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <DataTable
//             columns={columns}
//             data={institutes}
//             rowKey="instituteId"
//             onRowClick={(institute) => {
//               if (onSelectInstitute) {
//                 onSelectInstitute(institute); // 👈 Safe optional execution
//               }
//             }}
//             emptyMessage="No institutes found."
//           />
//           {totalCount > 0 && (
//             <Pagination
//               currentPage={currentTablePage}
//               pageSize={pageSize}
//               totalCount={totalCount}
//               totalPages={totalPages}
//               hasPrevious={hasPrevious}
//               hasNext={hasNext}
//               onPageChange={onPageChange}
//               onPageSizeChange={onPageSizeChange}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InstituteList;
import { Plus } from "lucide-react";

import SearchFilter from "../../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../../components/common/DataTable/Datatable";
import Pagination from "../../../components/common/DataTable/TablePagination";

import { getInstituteColumns } from "../columns";
// 🎯 Import type for FilterField
import type { FilterField } from "../../../components/common/SearchFilter/types";

import type {
  InstituteListType,
  InstituteFilterState,
} from "../institutetypes";
import { Button } from "../../../components/common/Button";

type Props = {
  fields: FilterField[];
  institutes: InstituteListType[];
  searchValue: string;
  filterValues: InstituteFilterState;
  errors?: Record<string, string>;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: any) => void;
  onSearch: () => void;
  onClear: () => void;

  // Actions
  openAdd?: () => void;
  onEdit: (institute: InstituteListType) => void;
  onDelete: (id: number) => void;
  onSelectInstitute?: (institute: InstituteListType) => void;
  deletingInstituteId?: number | null;
  // Pagination
  currentTablePage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;

  // 🎯 Sorting Props
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
  onSortChange?: (
    sortKey: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => void;
};

const InstituteList = ({
  fields,
  institutes,
  searchValue,
  filterValues,
  errors,
  onSearchChange,
  onFilterChange,
  onSearch,
  onClear,
  openAdd,
  onEdit,
  onDelete,
  onSelectInstitute,
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
  deletingInstituteId,
}: Props) => {
  const handleDeleteWithConfirmation = (id: number) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this institute? This action cannot be undone.",
    );
    if (isConfirmed) {
      onDelete(id);
    }
  };

  const columns = getInstituteColumns({
    onEdit,
    onDelete: handleDeleteWithConfirmation,
    onSelectInstitute,
    deletingInstituteId,
  });

  return (
    <div>
      {/* Search & Advanced Filters */}
      <SearchFilter
        searchKey="instituteName"
        fields={fields}
        searchValue={searchValue}
        searchPlaceholder="Search institute by name..."
        onSearchChange={onSearchChange}
        values={filterValues}
        errors={errors}
        onValueChange={onFilterChange}
        onSearch={onSearch}
        onClear={onClear}
      />

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={institutes}
            rowKey="instituteId"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            onRowClick={(institute) => {
              if (onSelectInstitute) {
                onSelectInstitute(institute);
              }
            }}
            emptyMessage="No institutes found."
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
      </div>
    </div>
  );
};

export default InstituteList;
