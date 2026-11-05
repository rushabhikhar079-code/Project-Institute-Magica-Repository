import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Network, X } from "lucide-react";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";

import { getBranchColumns } from "../../columns";
import type { BranchList } from "../../../branches/branchTypes";
import { getBranches } from "../../../branches/branchService";
import { Dropdown } from "../../../../components/common/Select";
import {
  exportStudyMaterial,
  getStudyMaterials,
} from "../studyMaterialService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { MultiSelectDropdown } from "../../../../components/common/MultiSelectDropdown";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";
import { StudyMaterialDto } from "../studyMaterialTypes";

const ExpStudyMaterial = () => {
  const navigate = useNavigate();
  const methods = useForm({
    defaultValues: {
      studyMaterialIds: [] as string[],
    },
  });
  const [branches, setBranches] = useState<BranchList[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
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

  const [studyMaterialOptions, setStudyMaterialOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchStudyMaterials = async () => {
      try {
        const response = await getStudyMaterials({
          branchId,
          courseId: null,
          subjectId: null,
          studyMaterialHeading: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,
          sortBy: null,
          sortDirection: null,
        });

        console.log("Study Material RESPONSE:", response);

        const options = (response.data?.items ?? [])
          .map((material: StudyMaterialDto) => ({
            value: String(material.studymaterialId),
            label: material.heading,
          }))
          .sort(
            (
              a: { value: string; label: string },
              b: { value: string; label: string },
            ) =>
              a.label.trim().localeCompare(b.label.trim(), undefined, {
                sensitivity: "base",
              }),
          );

        setStudyMaterialOptions(options);
      } catch (error) {
        console.error("Failed to fetch study materials:", error);
        setStudyMaterialOptions([]);
      }
    };

    fetchStudyMaterials();
  }, [branchId]);
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
  const handleExportStudyMaterial = async () => {
    const studyMaterialIds = methods.getValues("studyMaterialIds");

    if (!studyMaterialIds || studyMaterialIds.length === 0) {
      return;
    }

    if (selectedBranchIds.length === 0) {
      return;
    }

    try {
      const payload = {
        studyMaterialIds: studyMaterialIds.map(Number),
        branchIds: selectedBranchIds,
      };

      console.log("EXPORT Study Material PAYLOAD:", payload);

      const response = await exportStudyMaterial(payload);

      console.log("EXPORT Study Material RESPONSE:", response);

      toast.success("Study Material(s) exported successfully");
    } catch (error) {
      console.error("Failed to export Study Material:", error);
    }
  };
  const columns = getBranchColumns({
    selectedBranchIds,
    branches,
    onSelect: handleSelectBranch,
    onSelectAll: handleSelectAll,
  });

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <PageHeader
          title="Export Study Material to Branches"
          description="Select study material to export"
          extraBreadcrumbs={[
            {
              label: "Export Study Material to Branches",
            },
          ]}
        />
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="w-full max-w-xl">
            <MultiSelectDropdown
              name="studyMaterialIds"
              label="Study Material"
              required
              options={studyMaterialOptions}
            />
          </div>
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
              <Network className="w-3.5 h-3.5 text-[#0F4C81]" />
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

        <div>
          <ValidationErrorSummary />
          <div className="mt-4 flex items-center justify-start gap-3">
            <button
              type="button"
              onClick={handleExportStudyMaterial}
              disabled={
                selectedBranchIds.length === 0 ||
                methods.watch("studyMaterialIds").length === 0
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
    </FormProvider>
  );
};

export default ExpStudyMaterial;
