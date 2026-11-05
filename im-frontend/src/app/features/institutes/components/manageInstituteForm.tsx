import { useState, useEffect } from "react";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import { InstituteFilterState, InstituteListType } from "../institutetypes";
import {
  getInstitutes,
  getInstitutePlans,
  deleteInstitute,
} from "../instituteService";
import InstituteList from "../pages/InstituteList";
import { instituteFilterSchema } from "../instituteValidation";
import { toast } from "react-toastify";
import { instituteFilterFields as initialFields } from "../constants";
import { useNavigate } from "react-router-dom";
import { setAuthData } from "../../../redux/slices/authSlice";
import { fetchModules } from "../../../redux/slices/menuSlice";
import { useAppDispatch } from "../../../redux/hooks";
type Props = {
  setCurrentPage?: (page: string) => void;
  setSelectedInstitute?: (instituteId: number) => void;
};

export function ManageInstitutes({
  setCurrentPage,
  setSelectedInstitute,
}: Props) {
  const [institutes, setInstitutes] = useState<InstituteListType[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const [fields, setFields] = useState(initialFields);

  const initialFilterState: InstituteFilterState = {
    instituteName: "",
    contactPerson: "",
    email: "",
    phone: "",
    city: "",
    institutePlan: 0,
    status: 2,
    type: 2,
    registrationType: 2,
    expiryDateFrom: "",
    expiryDateTo: "",
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterValues, setFilterValues] =
    useState<InstituteFilterState>(initialFilterState);
  const [appliedFilters, setAppliedFilters] =
    useState<InstituteFilterState>(initialFilterState);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });

  const fetchInstitutes = async (
    filters: InstituteFilterState,
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = sortBy,
    currentSortDirection = sortDirection,
  ) => {
    try {
      const response = await getInstitutes(
        filters,
        pageNumber,
        pageSize,
        currentSortBy,
        currentSortDirection,
      );

      setInstitutes(response.items ?? []);
      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch institutes:", error);
      setInstitutes([]);
    }
  };

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const plansData = await getInstitutePlans();

        const formattedPlanOptions = plansData.map(
          (plan: { id: number; name: string }) => ({
            label: plan.name,
            value: plan.id,
          }),
        );

        const planOptionsWithDefault = [
          { label: "Select", value: 0 },
          ...formattedPlanOptions,
        ];
        setFields((prevFields) =>
          prevFields.map((field) =>
            field.key === "institutePlan"
              ? { ...field, options: planOptionsWithDefault }
              : field,
          ),
        );
      } catch (error) {
        console.error("Failed to load institute plans dropdown data:", error);
      }
    };
    const resetToSuperAdminContext = async () => {
      localStorage.removeItem("instituteId");

      dispatch(
        setAuthData({
          instituteId: 0,
          role: "1",
          branchId: 0,
        }),
      );
      console.log("🔄 Resetting Context -> instituteId:", 0);
      dispatch(fetchModules(0));
    };
    resetToSuperAdminContext();
    loadDropdownData();
    fetchInstitutes(appliedFilters, 1, pagination.pageSize);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setFilterValues((prev) => ({
      ...prev,
      instituteName: value,
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    const numericKeys = ["status", "type", "registrationType", "institutePlan"];

    setFilterValues((prev) => ({
      ...prev,
      [key]: numericKeys.includes(key) ? Number(value) : value,
    }));
  };

  const handleSearch = async () => {
    setErrors({});
    const dataToValidate = {
      ...filterValues,
      instituteName: searchValue, // 👈 🎯 ADD THIS LINE!
    };
    const validation = instituteFilterSchema.safeParse(dataToValidate);
    if (!validation.success) {
      console.warn("⚠️ Validation failed:", validation.error.format());

      const fieldErrors = validation.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string> = {};

      (Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>).forEach(
        (key) => {
          const messages = fieldErrors[key];
          if (messages && messages[0]) {
            formattedErrors[key] = messages[0];
          }
        },
      );

      setErrors(formattedErrors);
      return;
    }

    console.log("✅ Validation passed! Calling fetchInstitutes API...");
    setSortBy(null);
    setSortDirection(null);
    setCurrentTablePage(1);
    setAppliedFilters(filterValues);
    await fetchInstitutes(filterValues, 1, pagination.pageSize);
  };

  const handleClear = async () => {
    setErrors({});
    setSearchValue("");
    setFilterValues(initialFilterState);
    setAppliedFilters(initialFilterState);
    setCurrentTablePage(1);

    await fetchInstitutes(initialFilterState, 1, pagination.pageSize);
  };
  // Handle Sorting change when header is clicked
  const handleSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setCurrentTablePage(1);

    await fetchInstitutes(
      appliedFilters,
      1,
      pagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  const handleTablePageChange = async (page: number) => {
    setCurrentTablePage(page);
    await fetchInstitutes(appliedFilters, page, pagination.pageSize);
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setCurrentTablePage(1);
    await fetchInstitutes(filterValues, 1, newPageSize);
  };

  const handleOpenAdd = () => {
    console.log("Open add form");
    navigate("/subscription/manage-institutes/add");
  };

  const handleEdit = (institute: InstituteListType) => {
    navigate(`/subscription/manage-institutes/edit/${institute.instituteId}`);
    console.log("Edit institute:", institute);
  };

  const [deletingInstituteId, setDeletingInstituteId] = useState<number | null>(
    null,
  );
  const handleDelete = async (id: number) => {
    try {
      // Show loader for this institute
      setDeletingInstituteId(id);

      // Trigger API call
      await deleteInstitute(id);

      // Remove deleted item from local state
      setInstitutes((prev) => prev.filter((inst) => inst.instituteId !== id));

      // Show success notification
      toast.success("Institute deleted successfully!");
    } catch (error: any) {
      console.error("Delete failed:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete institute.",
      );
    } finally {
      // Hide loader
      setDeletingInstituteId(null);
    }
  };

  /*Get branches on click of institute name*/
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleSelectInstitute = async (institute: InstituteListType) => {
    const newInstId = institute.instituteId;

    localStorage.setItem("instituteId", String(newInstId));

    dispatch(
      setAuthData({
        instituteId: newInstId,
        role: "1",
        branchId: 0,
      }),
    );

    if (setSelectedInstitute) {
      setSelectedInstitute(newInstId);
    }

    navigate("/managebranches");
  };
  return (
    <div>
      <PageHeader
        title="Manage Institutes"
        description="View and manage all institute records"
        extraBreadcrumbs={[
          { label: "Subscription" },
          { label: "Manage Institutes" },
        ]}
      />

      <InstituteList
        fields={fields}
        institutes={institutes}
        searchValue={searchValue}
        filterValues={filterValues}
        errors={errors}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
        openAdd={handleOpenAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingInstituteId={deletingInstituteId}
        currentTablePage={currentTablePage}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        totalPages={pagination.totalPages}
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        onPageChange={handleTablePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSelectInstitute={handleSelectInstitute}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
export default ManageInstitutes;
