import { useState, useRef, useEffect } from "react";

import {
  Building2,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle,
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Upload,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import { BranchForm, BranchListResponse } from "../branchTypes";
import {
  getBranchById,
  getBranches,
  updateBranch,
  addnewBranch,
} from "../branchService";
import { EMPTY_BRANCH, fields, inp, lbl } from "./../constants";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import BranchList from "./BranchList";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useAppDispatch } from "../../../redux/hooks";
import { resetBranchState } from "../../../redux/slices/branchSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { FormProvider, Controller } from "react-hook-form";
import {
  branchSchema,
  type BranchFormValidation,
} from "../validations/BranchSchema";
import { LocationSection } from "../../../components/common/LocationSection";
import { deleteBranch } from "../branchService";
import { toast } from "react-toastify";
import { Outlet } from "react-router-dom";
type Props = {
  setCurrentPage: (page: string) => void;
  setSelectedBranch: (branch: string) => void;
};
export function ManageBranchess({ setCurrentPage, setSelectedBranch }: Props) {
  // 'list' | 'edit' | 'add'
  const dispatch = useAppDispatch();
  const location = useLocation();

  const isChildRoute =
    location.pathname.endsWith("/add") || location.pathname.includes("/edit/");
  useEffect(() => {
    dispatch(resetBranchState());
  }, [dispatch]);
  const [view, setView] = useState<"list" | "edit" | "add">("list");
  const [editingBranch, setEditingBranch] = useState<BranchForm | null>(null);
  const navigate = useNavigate();
  const [addBranch, setAddBranch] = useState<Omit<BranchForm, "id">>({
    ...EMPTY_BRANCH,
  });
  const [sameAsAbove, setSameAsAbove] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [filterValues, setFilterValues] = useState({
    branchName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    city: "",
    status: "2",
  });
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    setFilterValues((prev) => ({
      ...prev,
      branchName: value,
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  // Franchise center state
  const [isFranchise, setIsFranchise] = useState(false);
  const [franchiseFile, setFranchiseFile] = useState<string | null>(null);
  const [signUpDate, setSignUpDate] = useState("2026-08-06");
  const [signUpAmount, setSignUpAmount] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [testFee, setTestFee] = useState("");
  const [certFee, setCertFee] = useState("");
  const [feeCommission, setFeeCommission] = useState("");
  const [fixedStudentFee, setFixedStudentFee] = useState("");
  const franchiseFileRef = useRef<HTMLInputElement>(null);
  const instituteId = useSelector(
    (state: RootState) => state.branch.instituteId,
  );

  const [branches, setBranches] = useState<BranchList[]>([]);
  const handleSearch = async () => {
    await fetchBranches(filterValues);
  };
  const handleClear = async () => {
    const emptyFilters = {
      branchName: "",
      contactPerson: "",
      email: "",
      mobile: "",
      city: "",
      status: "2",
    };
    setSearchValue("");
    setFilterValues(emptyFilters);

    await fetchBranches(emptyFilters);
  };
  const [currentTablePage, setCurrentTablePage] = useState(1);

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });
  const [sortBy, setSortBy] = useState<string | null>(null);

  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );
  const fetchBranches = async (
    filters: typeof filterValues,
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = sortBy,
    currentSortDirection = sortDirection,
  ) => {
    try {
      const response = await getBranches({
        branchName: filters.branchName,
        city: filters.city,
        contactPerson: filters.contactPerson,
        email: filters.email,
        mobile: filters.mobile,
        status: Number(filters.status),
        pageNumber,
        pageSize,

        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      });

      console.log("GET BRANCHES RESPONSE:", response);
      console.log("ITEMS:", response.items);
      console.log("ITEM COUNT:", response.items?.length);

      setBranches(response.items ?? []);

      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      setBranches([]);
    }
  };
  useEffect(() => {
    const updatedBranchId = location.state?.updatedBranchId;

    if (!updatedBranchId) {
      return;
    }

    const refreshUpdatedBranch = async () => {
      try {
        console.log("Refreshing updated branch:", updatedBranchId);

        const response = await getBranchById(updatedBranchId);

        console.log("UPDATED BRANCH RESPONSE:", response);

        const updatedBranch = response.data;

        setBranches((prev) =>
          prev.map((branch) =>
            branch.branchId === updatedBranchId
              ? {
                  ...branch,
                  branchName: updatedBranch.branchName ?? branch.branchName,
                  contactPerson:
                    updatedBranch.contactPerson ?? branch.contactPerson,
                  cpMobile: updatedBranch.cpMobile ?? branch.cpMobile,
                  cpEmail: updatedBranch.cpEmail ?? branch.cpEmail,
                  statusId: updatedBranch.statusId ?? branch.statusId,
                  branchStatus:
                    updatedBranch.status === 1
                      ? "Active"
                      : updatedBranch.status === 0
                        ? "Inactive"
                        : branch.branchStatus,
                  taxRate: updatedBranch.taxRate ?? branch.taxRate,
                }
              : branch,
          ),
        );
      } catch (error) {
        console.error("Failed to refresh updated branch:", error);
        // toast.error("Failed to refresh updated branch");
      } finally {
        // Clear the navigation state so it doesn't run again
        navigate(location.pathname, {
          replace: true,
          state: {},
        });
      }
    };

    refreshUpdatedBranch();
  }, [location.state]);
  const handleTablePageChange = async (page: number) => {
    setCurrentTablePage(page);

    await fetchBranches(filterValues, page, pagination.pageSize);
  };

  const methods = useForm<BranchFormValidation>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",

      country: "India",
      countryId: 1,

      state: "",
      stateId: 1,
      city: "",
      cityId: 1,

      pinCode: "",
      phone: "",
      email: "",
      taxRate: "",
      status: "Active",

      contactName: "",
      contactMobile: "",
      contactEmail: "",

      signUpDate: "",
      signUpAmount: "",
      monthlyFee: "",
      testFee: "",
      certFee: "",
      feeCommission: "",
      fixedStudentFee: "",
      otherCity: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = methods;
  useEffect(() => {
    fetchBranches({
      branchName: "",
      city: "",
      contactPerson: "",
      email: "",
      mobile: "",
      status: "2",
    });
  }, []);
  const openEdit = (branch: BranchList) => {
    navigate(`edit/${branch.branchId}`);
  };
  const openAdd = () => {
    navigate("add");
  };
  const handleDelete = async (branchId: number) => {
    const branch = branches.find((b) => b.branchId === branchId);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${branch?.branchName}"? All associated data and records may be affected. This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }
    try {
      await deleteBranch(branchId);
      toast.success(
        `Branch deleted successfully: ${branch?.branchName} (ID: ${branchId})`,
      );
      console.log(
        `Branch deleted successfully: ${branch?.branchName} (ID: ${branchId})`,
      );
      setCurrentTablePage(1);
      // Refresh table after successful delete
      await fetchBranches({
        branchName: "",
        city: "",
        contactPerson: "",
        email: "",
        mobile: "",
        status: "2",
      });
    } catch (error) {
      console.error("Failed to delete branch:", error);
    }
  };

  const handleSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);

    // Reset pagination when sorting changes
    setCurrentTablePage(1);

    await fetchBranches(
      filterValues,
      1,
      pagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  const saveEdit = () => {
    setView("list");
  };

  const saveAdd = () => {
    setView("list");
  };
  const [statusChanged, setStatusChanged] = useState(false);

  // ── Full-page Edit / Add form ─────────────────────────────────────────────
  if (view === "edit" || view === "add") {
    const isEdit = view === "edit";

    if (isEdit && !editingBranch) {
      return null;
    }

    const form = isEdit ? editingBranch! : addBranch;

    const setForm = isEdit
      ? (upd: Partial<BranchForm>) =>
          setEditingBranch((prev) => (prev ? { ...prev, ...upd } : prev))
      : (upd: Partial<BranchForm>) =>
          setAddBranch((prev) => ({ ...prev, ...upd }));

    const handleSameAsAbove = async (checked: boolean) => {
      setSameAsAbove(checked);

      if (checked) {
        const phone = getValues("phone");
        const email = getValues("email");

        setValue("contactMobile", phone || "", {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });

        setValue("contactEmail", email || "", {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      } else {
        setValue("contactMobile", "", {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });

        setValue("contactEmail", "", {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }

      await trigger(["contactMobile", "contactEmail"]);
    };
    // const onSubmit = async (data: BranchFormValidation) => {
    //   console.log("✅ FORM SUBMITTED");
    //   console.log("FORM DATA:", data);
    //   console.log("IS EDIT:", isEdit);

    //   try {
    //     if (isEdit) {
    //       if (!editingBranch?.id) {
    //         console.error("Branch ID is missing");
    //         toast.error("Branch ID is missing");
    //         return;
    //       }

    //       const response = await updateBranch(editingBranch.id, data);

    //       console.log("Branch updated successfully:", response);
    //       toast.success("Branch updated successfully");
    //     } else {
    //       const response = await addnewBranch(data);

    //       console.log("Branch added successfully:", response);
    //       toast.success("Branch added successfully");
    //     }

    //     setView("list");

    //     await fetchBranches({
    //       branchName: "",
    //       city: "",
    //       contactPerson: "",
    //       email: "",
    //       mobile: "",
    //       status: "2",
    //     });
    //   } catch (error) {
    //     console.error("Submit error:", error);

    //     toast.error(
    //       isEdit ? "Failed to update branch" : "Failed to add branch",
    //     );
    //   }
    // };
    // const branchName = watch("name");

    return (
      <ManageBranchess setCurrentPage={() => {}} setSelectedBranch={() => {}} />
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  // ── List view ─────────────────────────────────────────────

  return (
    <div>
      {!isChildRoute && (
        <>
          <PageHeader />

          <BranchList
            branches={branches}
            fields={fields}
            openAdd={openAdd}
            onEdit={openEdit}
            onDelete={handleDelete}
            searchValue={searchValue}
            filterValues={filterValues}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClear={handleClear}
            setCurrentPage={setCurrentPage}
            setSelectedBranch={setSelectedBranch}
            currentTablePage={currentTablePage}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            onPageChange={handleTablePageChange}
            onPageSizeChange={(newPageSize) => {
              setCurrentTablePage(1);
              fetchBranches(filterValues, 1, newPageSize);
            }}
          />
        </>
      )}

      <Outlet
        context={{
          resetBranchPagination: async () => {
            setCurrentTablePage(1);

            await fetchBranches(
              {
                branchName: "",
                city: "",
                contactPerson: "",
                email: "",
                mobile: "",
                status: "2",
              },
              1,
              pagination.pageSize,
            );
          },
        }}
      />
    </div>
  );
}
