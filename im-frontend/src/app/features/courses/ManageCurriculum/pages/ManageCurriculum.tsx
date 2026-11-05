import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import CurriculumList from "./CurriculumList";

import type {
  CurriculumList as CurriculumListType,
  InstituteCurriculum,
} from "../types";
import type { FilterField } from "../../../../components/common/SearchFilter/types";

import {
  getCurriculums,
  getInstituteCurriculumsForImport,
  importCurriculums,
  deleteCurriculum,
} from "../curriculumService";

import { fields } from "../constants";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { setGlobalError } from "../../../../redux/slices/errorSlice";

type Props = {
  setCurrentPage: (page: string) => void;
  setSelectedCurriculum: (curriculum: string) => void;
};

type FilterValues = {
  curriculumName: string;
  status: string;
};

export type CurriculumOutletContext = {
  curriculums: CurriculumListType[];

  instituteCurriculums: InstituteCurriculum[];

  onAddCurriculum: (curriculumIds: number[]) => Promise<void>;

  // Manage Curriculum pagination
  currentTablePage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  // Institute Curriculum pagination
  instituteCurrentTablePage: number;
  institutePageSize: number;
  instituteTotalCount: number;
  instituteTotalPages: number;
  instituteHasPrevious: boolean;
  instituteHasNext: boolean;
  // Main curriculum sorting
  sortBy: string | null;
  sortDirection: "asc" | "desc" | null;
  onSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => Promise<void>;

  // Institute curriculum import sorting
  instituteSortBy: string | null;
  instituteSortDirection: "asc" | "desc" | null;
  onInstituteSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => Promise<void>;

  onPageChange: (page: number) => Promise<void>;
  onPageSizeChange: (pageSize: number) => Promise<void>;

  onInstitutePageChange: (page: number) => Promise<void>;
  onInstitutePageSizeChange: (pageSize: number) => Promise<void>;

  resetCurriculumPagination: () => Promise<void>;
};

const EMPTY_FILTERS: FilterValues = {
  curriculumName: "",
  status: "2",
};

export function ManageCurriculum({
  setCurrentPage,
  setSelectedCurriculum,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [curriculums, setCurriculums] = useState<CurriculumListType[]>([]);

  const [searchValue, setSearchValue] = useState("");

  const [filterValues, setFilterValues] = useState<FilterValues>(EMPTY_FILTERS);

  const [currentTablePage, setCurrentTablePage] = useState(1);
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  console.log("branchId from Redux:", branchId);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });

  // ============================================================
  // INSTITUTE CURRICULUM STATE
  // ============================================================

  const [instituteCurriculums, setInstituteCurriculums] = useState<
    InstituteCurriculum[]
  >([]);

  const [instituteCurrentTablePage, setInstituteCurrentTablePage] = useState(1);

  const [institutePagination, setInstitutePagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });

  // ============================================================
  // CHILD ROUTE
  // ============================================================

  const isChildRoute =
    location.pathname.endsWith("/add") ||
    location.pathname.includes("/edit/") ||
    location.pathname.endsWith("/instcurriculums") ||
    location.pathname.endsWith("/expcurriculums");

  // ============================================================
  // FETCH MANAGE CURRICULUMS
  // ============================================================
  const [sortBy, setSortBy] = useState<string | null>(null);

  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );

  const fetchCurriculums = async (
    filters: FilterValues,
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = sortBy,
    currentSortDirection = sortDirection,
  ) => {
    try {
      const response = await getCurriculums({
        pageNumber,
        pageSize,
        curriculumName: filters.curriculumName,
        status: Number(filters.status) || 0,
        branchId,
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      });

      console.log("GET CURRICULUMS RESPONSE:", response);

      setCurriculums(response.items ?? []);

      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch curriculums:", error);
      setCurriculums([]);
    }
  };
  useEffect(() => {
    const updatedCurriculumId = location.state?.updatedCurriculumId;

    if (!updatedCurriculumId) return;

    const refreshCurriculumList = async () => {
      await fetchCurriculums(
        filterValues,
        currentTablePage,
        pagination.pageSize,
      );

      // Clear navigation state so it doesn't refresh again
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    };

    refreshCurriculumList();
  }, [location.state]);
  // =========================
  // ============================================================
  // FETCH INSTITUTE CURRICULUMS
  // ============================================================
  const [instituteSortBy, setInstituteSortBy] = useState<string | null>(null);

  const [instituteSortDirection, setInstituteSortDirection] = useState<
    "asc" | "desc" | null
  >(null);
  const fetchInstituteCurriculums = async (
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = instituteSortBy,
    currentSortDirection = instituteSortDirection,
  ) => {
    try {
      if (branchId === 0) {
        setInstituteCurriculums([]);
        return;
      }

      const response = await getInstituteCurriculumsForImport({
        pageNumber,
        pageSize,
        branchId,
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      });

      console.log("GET INSTITUTE CURRICULUMS FOR IMPORT:", response);

      setInstituteCurriculums(response.items ?? []);

      setInstitutePagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch institute curriculums:", error);

      setInstituteCurriculums([]);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (branchId === null || branchId === undefined) return;

    fetchCurriculums(EMPTY_FILTERS, 1, pagination.pageSize);
  }, [branchId]);

  // ============================================================
  // FETCH INSTITUTE CURRICULUMS WHEN OPENING THAT PAGE
  // ============================================================

  useEffect(() => {
    if (location.pathname.endsWith("/instcurriculums") && branchId !== 0) {
      fetchInstituteCurriculums(1, 10);
    }
  }, [location.pathname, branchId]);
  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    setFilterValues((prev) => ({
      ...prev,
      curriculumName: value,
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = async () => {
    setCurrentTablePage(1);

    await fetchCurriculums(filterValues, 1, pagination.pageSize);
  };

  const handleClear = async () => {
    setSearchValue("");
    setFilterValues(EMPTY_FILTERS);
    setCurrentTablePage(1);

    await fetchCurriculums(EMPTY_FILTERS, 1, pagination.pageSize);
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const openAdd = () => {
    navigate("add");
  };

  const openAddFromInst = () => {
    navigate("instcurriculums");
    setInstituteSortBy(null);
    setInstituteSortDirection(null);
    setInstituteCurrentTablePage(1);
  };
  const openexpToBranch = () => {
    navigate("expcurriculums");
  };
  const openEdit = (curriculum: CurriculumListType) => {
    navigate(`edit/${curriculum.CurriculumId}`);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (curriculumId: number) => {
    const curriculum = curriculums.find(
      (item) => item.CurriculumId === curriculumId,
    );

    const curriculumName = curriculum?.CurriculumName || "this curriculum";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${curriculumName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCurriculum(curriculumId);

      toast.success(`Curriculum deleted successfully: ${curriculumName}`);

      await fetchCurriculums(
        filterValues,
        currentTablePage,
        pagination.pageSize,
      );
    } catch (error: any) {
      console.error("DELETE CURRICULUM ERROR:", error);

      const responseData = error?.response?.data;

      console.log("DELETE RESPONSE DATA:", responseData);

      const status =
        error?.response?.status ??
        responseData?.statusCode ??
        error?.statusCode ??
        400;

      const message =
        responseData?.message ??
        error?.message ??
        "Unable to delete curriculum.";

      console.log("SETTING GLOBAL ERROR:", {
        status,
        message,
      });

      dispatch(
        setGlobalError({
          status: Number(status),
          message,
        }),
      );
    }
  };
  // ============================================================
  // MANAGE CURRICULUM PAGINATION
  // ============================================================

  const handleTablePageChange = async (page: number) => {
    setCurrentTablePage(page);

    await fetchCurriculums(filterValues, page, pagination.pageSize);
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setCurrentTablePage(1);

    await fetchCurriculums(filterValues, 1, newPageSize);
  };

  // ============================================================
  // INSTITUTE CURRICULUM PAGINATION
  // ============================================================

  const handleInstitutePageChange = async (page: number) => {
    setInstituteCurrentTablePage(page);

    await fetchInstituteCurriculums(page, institutePagination.pageSize);
  };

  const handleInstitutePageSizeChange = async (newPageSize: number) => {
    setInstituteCurrentTablePage(1);

    await fetchInstituteCurriculums(1, newPageSize);
  };

  // ============================================================
  // REFRESH MANAGE CURRICULUM
  // ============================================================

  const resetCurriculumPagination = async () => {
    setCurrentTablePage(1);

    await fetchCurriculums(filterValues, 1, pagination.pageSize);
  };

  // ============================================================
  // ADD SELECTED INSTITUTE CURRICULUM
  // ============================================================

  const handleAddCurriculum = async (curriculumIds: number[]) => {
    try {
      if (branchId === 0) {
        toast.error("Branch ID is missing");
        return;
      }

      console.log("Selected curriculum IDs:", curriculumIds);

      const payload = {
        curriculumIds,
        branchId,
      };

      console.log("IMPORT CURRICULUM PAYLOAD:", payload);

      const response = await importCurriculums(payload);

      console.log("IMPORT CURRICULUM RESPONSE:", response);

      toast.success("Curriculum(s) imported successfully");

      await fetchCurriculums(EMPTY_FILTERS, 1, pagination.pageSize);

      navigate("/managecurriculums");
    } catch (error) {
      console.error("Failed to import curriculum:", error);
      // toast.error("Failed to import curriculum");
    }
  };
  const handleSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);

    setCurrentTablePage(1);

    await fetchCurriculums(
      filterValues,
      1,
      pagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  const handleInstituteSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setInstituteSortBy(newSortBy);
    setInstituteSortDirection(newSortDirection);

    setInstituteCurrentTablePage(1);

    await fetchInstituteCurriculums(
      1,
      institutePagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      {!isChildRoute && (
        <>
          <PageHeader />

          <CurriculumList
            curriculums={curriculums}
            fields={fields as FilterField[]}
            openAdd={openAdd}
            openaddFromInst={openAddFromInst}
            openexpToBranch={openexpToBranch}
            onEdit={openEdit}
            onDelete={handleDelete}
            searchValue={searchValue}
            filterValues={filterValues}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClear={handleClear}
            setCurrentPage={setCurrentPage}
            setSelectedCurriculum={setSelectedCurriculum}
            currentTablePage={currentTablePage}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            onPageChange={handleTablePageChange}
            onPageSizeChange={handlePageSizeChange}
            // Sorting
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
          <ValidationErrorSummary />
        </>
      )}

      <Outlet
        context={{
          // Manage Curriculum
          curriculums,

          // Institute Curriculum
          instituteCurriculums,

          onAddCurriculum: handleAddCurriculum,

          // Manage pagination
          currentTablePage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          totalPages: pagination.totalPages,
          hasPrevious: pagination.hasPrevious,
          hasNext: pagination.hasNext,

          onPageChange: handleTablePageChange,
          onPageSizeChange: handlePageSizeChange,

          // Institute pagination
          instituteCurrentTablePage,
          institutePageSize: institutePagination.pageSize,
          instituteTotalCount: institutePagination.totalCount,
          instituteTotalPages: institutePagination.totalPages,
          instituteHasPrevious: institutePagination.hasPrevious,
          instituteHasNext: institutePagination.hasNext,
          // Import sorting
          sortBy,
          sortDirection,
          onSortChange: handleSortChange,

          instituteSortBy,
          instituteSortDirection,
          onInstituteSortChange: handleInstituteSortChange,
          onInstitutePageChange: handleInstitutePageChange,
          onInstitutePageSizeChange: handleInstitutePageSizeChange,

          resetCurriculumPagination,
        }}
      />
    </div>
  );
}
