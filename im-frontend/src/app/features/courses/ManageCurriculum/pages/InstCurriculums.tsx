// import { useState } from "react";
// import { useNavigate, useOutletContext } from "react-router-dom";
// import { X } from "lucide-react";

// import DataTable from "../../../../components/common/DataTable/Datatable";
// import Pagination from "../../../../components/common/DataTable/TablePagination";

// import { getInstituteCurriculumColumns } from "../columns";
// import type { CurriculumOutletContext } from "./ManageCurriculum";

// import PageHeader from "../../../../components/common/PageHeader/PageHeader";

// const InstCurriculums = () => {
//   const {
//     instituteCurriculums,
//     onAddCurriculum,

//     instituteCurrentTablePage,
//     institutePageSize,
//     instituteTotalCount,
//     instituteTotalPages,
//     instituteHasPrevious,
//     instituteHasNext,
//     instituteSortBy,
//     instituteSortDirection,
//     onInstituteSortChange,
//     onInstitutePageChange,
//     onInstitutePageSizeChange,
//   } = useOutletContext<CurriculumOutletContext>();

//   const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<number[]>(
//     [],
//   );

//   const navigate = useNavigate();
//   const activeCurriculums = instituteCurriculums.filter(
//     (curriculum) => curriculum.crclmStatus === true,
//   );
//   const totalCount = activeCurriculums.length;

//   const totalPages = Math.ceil(totalCount / institutePageSize);

//   const paginatedCurriculums = activeCurriculums.slice(
//     (instituteCurrentTablePage - 1) * institutePageSize,
//     instituteCurrentTablePage * institutePageSize,
//   );

//   const handleSelectCurriculum = (id: number) => {
//     setSelectedCurriculumIds((prev) =>
//       prev.includes(id)
//         ? prev.filter((curriculumId) => curriculumId !== id)
//         : [...prev, id],
//     );
//   };
//   const handleSelectAll = () => {
//     const selectableIds = activeCurriculums
//       .filter((curriculum) => !curriculum.isImported)
//       .map((curriculum) => curriculum.crclmId);

//     const allSelected =
//       selectableIds.length > 0 &&
//       selectableIds.every((id) => selectedCurriculumIds.includes(id));

//     if (allSelected) {
//       setSelectedCurriculumIds([]);
//     } else {
//       setSelectedCurriculumIds(selectableIds);
//     }
//   };
//   const handleAddCurriculum = async () => {
//     if (selectedCurriculumIds.length === 0) {
//       return;
//     }

//     await onAddCurriculum(selectedCurriculumIds);
//   };

//   const columns = getInstituteCurriculumColumns({
//     selectedCurriculumIds,
//     curriculums: activeCurriculums,
//     onSelect: handleSelectCurriculum,
//     onSelectAll: handleSelectAll,
//   });
//   return (
//     <div className="space-y-4">
//       <PageHeader
//         title="Import Curriculum from Institute"
//         description="Select a curriculum to add to your institute"
//         extraBreadcrumbs={[
//           {
//             label: "Import Curriculum from Institute",
//           },
//         ]}
//       />

//       <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//         <div className="overflow-x-auto">
//           <DataTable
//             columns={columns}
//             data={activeCurriculums}
//             sortBy={instituteSortBy}
//             sortDirection={instituteSortDirection}
//             onSortChange={handleInstituteSortChange}
//             rowKey="crclmId"
//             emptyMessage="No Curriculums found."
//           />

//           {instituteTotalCount > 0 && (
//             <Pagination
//               currentPage={instituteCurrentTablePage}
//               pageSize={institutePageSize}
//               totalCount={totalCount}
//               totalPages={totalPages}
//               hasPrevious={instituteCurrentTablePage > 1}
//               hasNext={instituteCurrentTablePage < totalPages}
//               onPageChange={onInstitutePageChange}
//               onPageSizeChange={onInstitutePageSizeChange}
//             />
//           )}
//         </div>
//       </div>

//       <div className="flex items-center gap-3 pt-2">
//         <button
//           type="button"
//           onClick={handleAddCurriculum}
//           disabled={selectedCurriculumIds.length === 0}
//           className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Import Curriculum(s)
//         </button>

//         <button
//           type="button"
//           onClick={() => navigate("..")}
//           className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
//         >
//           <X className="w-4 h-4" />
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InstCurriculums;
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { X } from "lucide-react";

import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";
import { getInstituteCurriculumColumns } from "../columns";
import type { CurriculumOutletContext } from "./ManageCurriculum";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";

const InstCurriculums = () => {
  const {
    instituteCurriculums,
    onAddCurriculum,

    // Pagination
    instituteCurrentTablePage,
    institutePageSize,
    instituteTotalCount,
    instituteTotalPages,
    instituteHasPrevious,
    instituteHasNext,

    // Sorting
    instituteSortBy,
    instituteSortDirection,
    onInstituteSortChange,

    // Pagination handlers
    onInstitutePageChange,
    onInstitutePageSizeChange,
  } = useOutletContext<CurriculumOutletContext>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);

  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<number[]>(
    [],
  );

  const navigate = useNavigate();

  const handleSelectCurriculum = (id: number) => {
    setSelectedCurriculumIds((prev) =>
      prev.includes(id)
        ? prev.filter((curriculumId) => curriculumId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    // Select only the records currently loaded on this page.
    const selectableIds = instituteCurriculums
      .filter((curriculum) => !curriculum.isImported)
      .map((curriculum) => curriculum.crclmId);

    const allSelected =
      selectableIds.length > 0 &&
      selectableIds.every((id) => selectedCurriculumIds.includes(id));

    if (allSelected) {
      setSelectedCurriculumIds((prev) =>
        prev.filter((id) => !selectableIds.includes(id)),
      );
    } else {
      setSelectedCurriculumIds((prev) => [
        ...new Set([...prev, ...selectableIds]),
      ]);
    }
  };

  const handleAddCurriculum = async () => {
    if (selectedCurriculumIds.length === 0) {
      return;
    }

    await onAddCurriculum(selectedCurriculumIds);
  };

  const columns = getInstituteCurriculumColumns({
    selectedCurriculumIds,
    curriculums: instituteCurriculums,
    onSelect: handleSelectCurriculum,
    onSelectAll: handleSelectAll,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Import Curriculums from Institute"
        description="Select a curriculum to add to your institute"
        extraBreadcrumbs={[
          {
            label: "Import Curriculums from Institute",
          },
        ]}
      />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={instituteCurriculums}
            sortBy={instituteSortBy}
            sortDirection={instituteSortDirection}
            onSortChange={onInstituteSortChange}
            rowKey="crclmId"
            emptyMessage="No Curriculums found."
          />

          {instituteTotalCount > 0 && (
            <Pagination
              currentPage={instituteCurrentTablePage}
              pageSize={institutePageSize}
              totalCount={instituteTotalCount}
              totalPages={instituteTotalPages}
              hasPrevious={instituteHasPrevious}
              hasNext={instituteHasNext}
              onPageChange={onInstitutePageChange}
              onPageSizeChange={onInstitutePageSizeChange}
            />
          )}
        </div>
      </div>

      <div>
        <ValidationErrorSummary />
        <div className="mt-4 flex items-center justify-start gap-3">
          <button
            type="button"
            onClick={handleAddCurriculum}
            disabled={selectedCurriculumIds.length === 0}
            className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Curriculum(s)
          </button>

          <button
            type="button"
            onClick={() => navigate("..")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstCurriculums;
