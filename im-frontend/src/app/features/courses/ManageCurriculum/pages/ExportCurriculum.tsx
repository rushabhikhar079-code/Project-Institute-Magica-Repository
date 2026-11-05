import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Building2, Layers, Network, School, X } from "lucide-react";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";

import { getBranchColumns } from "../../columns";
import type { BranchList } from "../../../branches/branchTypes";
import { getBranches } from "../../../branches/branchService";
import { Dropdown } from "../../../../components/common/Select";
import { exportCurriculum, getCurriculums } from "../curriculumService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { MultiSelectDropdown } from "../../../../components/common/MultiSelectDropdown";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";
import { CurriculumList } from "../types";
import { getExportCurriculumColumns } from "../columns";

const ExpCurriculums = () => {
  const navigate = useNavigate();

  const [branches, setBranches] = useState<BranchList[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumList[]>([]);
  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<number[]>(
    [],
  );
  const [curriculumCurrentPage, setCurriculumCurrentPage] = useState(1);
  const [curriculumPageSize, setCurriculumPageSize] = useState(10);

  const [curriculumTotalCount, setCurriculumTotalCount] = useState(0);
  const [curriculumTotalPages, setCurriculumTotalPages] = useState(0);
  const [curriculumHasPrevious, setCurriculumHasPrevious] = useState(false);
  const [curriculumHasNext, setCurriculumHasNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await getBranches({
        branchName: "",
        city: "",
        contactPerson: "",
        email: "",
        mobile: "",
        status: 1,
        pageNumber: currentPage,
        pageSize,
      });

      setBranches(response.items ?? []);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setHasPrevious(response.hasPrevious);
      setHasNext(response.hasNext);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      setBranches([]);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [currentPage, pageSize]);
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const response = await getCurriculums({
          pageNumber: curriculumCurrentPage,
          pageSize: curriculumPageSize,
          curriculumName: "",
          status: 1,
          branchId,
        });

        const sortedCurriculums = [...(response.items ?? [])].sort((a, b) => {
          const nameA = a.CurriculumName.trim();
          const nameB = b.CurriculumName.trim();

          const isNumberA = /^\d/.test(nameA);
          const isNumberB = /^\d/.test(nameB);

          if (isNumberA && !isNumberB) return -1;
          if (!isNumberA && isNumberB) return 1;

          if (isNumberA && isNumberB) {
            const digitA = Number(nameA[0]);
            const digitB = Number(nameB[0]);

            if (digitA !== digitB) {
              return digitA - digitB;
            }

            return nameA.localeCompare(nameB, undefined, {
              sensitivity: "base",
            });
          }

          return nameA.localeCompare(nameB, undefined, {
            sensitivity: "base",
          });
        });

        setCurriculums(sortedCurriculums);

        setCurriculumTotalCount(response.totalCount);
        setCurriculumTotalPages(response.totalPages);
        setCurriculumHasPrevious(response.hasPrevious);
        setCurriculumHasNext(response.hasNext);
      } catch (error) {
        console.error("Failed to fetch curriculums:", error);
        setCurriculums([]);
      }
    };

    fetchCurriculums();
  }, [branchId, curriculumCurrentPage, curriculumPageSize]);
  const handleSelectCurriculum = (id: number) => {
    setSelectedCurriculumIds((prev) =>
      prev.includes(id)
        ? prev.filter((curriculumId) => curriculumId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAllCurriculums = () => {
    const curriculumIds = curriculums.map(
      (curriculum) => curriculum.CurriculumId,
    );

    const allSelected =
      curriculumIds.length > 0 &&
      curriculumIds.every((id) => selectedCurriculumIds.includes(id));

    if (allSelected) {
      setSelectedCurriculumIds((prev) =>
        prev.filter((id) => !curriculumIds.includes(id)),
      );
    } else {
      setSelectedCurriculumIds((prev) => [
        ...new Set([...prev, ...curriculumIds]),
      ]);
    }
  };
  const handleSelectBranch = (id: number) => {
    setSelectedBranchIds((prev) =>
      prev.includes(id)
        ? prev.filter((branchId) => branchId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const branchIds = branches.map((branch) => branch.branchId);

    const allSelected =
      branchIds.length > 0 &&
      branchIds.every((id) => selectedBranchIds.includes(id));

    if (allSelected) {
      setSelectedBranchIds((prev) =>
        prev.filter((id) => !branchIds.includes(id)),
      );
    } else {
      setSelectedBranchIds((prev) => [...new Set([...prev, ...branchIds])]);
    }
  };
  const handleExportCurriculum = async () => {
    const curriculumIds = selectedCurriculumIds;

    try {
      const payload = {
        curriculumIds: curriculumIds,
        branchIds: selectedBranchIds,
      };
      console.log("EXPORT CURRICULUM PAYLOAD:", payload);

      const response = await exportCurriculum(payload);

      console.log("EXPORT CURRICULUM RESPONSE:", response);

      toast.success("Curriculum exported successfully");

      navigate("/managecurriculums");
    } catch (error) {
      console.error("Failed to export curriculum:", error);
    }
  };

  const columns = getBranchColumns({
    selectedBranchIds,
    branches,
    onSelect: handleSelectBranch,
    onSelectAll: handleSelectAll,
  });
  const curriculumColumns = getExportCurriculumColumns({
    selectedCurriculumIds,
    curriculums,
    onSelect: handleSelectCurriculum,
    onSelectAll: handleSelectAllCurriculums,
  });
  console.log("curriculumCurrentPage:", curriculumCurrentPage);
  console.log("branch currentPage:", currentPage);
  return (
    <div className="space-y-4">
      <PageHeader
        title="Export Curriculums to Branches"
        description="Select branches to export curriculum"
        extraBreadcrumbs={[
          {
            label: "Export Curriculums to Branches",
          },
        ]}
      />
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
          <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 stroke-[2]" />
          </div>

          <h2 className="text-lg font-bold text-[#0F4C81]">Curriculums</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={curriculumColumns}
              data={curriculums}
              rowKey="CurriculumId"
              emptyMessage="No curriculums found."
            />

            {curriculumTotalCount > 0 && (
              <Pagination
                currentPage={curriculumCurrentPage}
                pageSize={curriculumPageSize}
                totalCount={curriculumTotalCount}
                totalPages={curriculumTotalPages}
                hasPrevious={curriculumHasPrevious}
                hasNext={curriculumHasNext}
                onPageChange={setCurriculumCurrentPage}
                onPageSizeChange={(size) => {
                  setCurriculumPageSize(size);
                  setCurriculumCurrentPage(1);
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
          <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-building2 lucide-building-2 w-5 h-5 stroke-[2]"
            >
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
              <path d="M10 6h4"></path>
              <path d="M10 10h4"></path>
              <path d="M10 14h4"></path>
              <path d="M10 18h4"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#0F4C81]">Branches</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={branches}
              rowKey="branchId"
              emptyMessage="No branches found."
            />

            {totalCount > 0 && (
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount}
                totalPages={totalPages}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
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
      <div>
        <ValidationErrorSummary />
        <div className="mt-4 flex items-center justify-start gap-3">
          <button
            type="button"
            onClick={handleExportCurriculum}
            disabled={
              selectedBranchIds.length === 0 ||
              selectedCurriculumIds.length === 0
            }
            className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export to branch(es)
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

export default ExpCurriculums;
