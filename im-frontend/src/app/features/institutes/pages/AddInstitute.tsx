import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TableColumn } from "../../../components/common/DataTable/types";
import {
  AccountHistoryDto,
  AccountHistorySearchDto,
} from "../accountHistoryTypes";
import { SquarePen } from "lucide-react";
import DataTable from "../../../components/common/DataTable/Datatable";
import Pagination from "../../../components/common/DataTable/TablePagination";
import {
  Building2,
  CheckCircle,
  Save,
  X,
  Upload,
  ShieldCheck,
  History,
  Watch,
  CreditCard,
} from "lucide-react";

import PageHeader from "../../../components/common/PageHeader/PageHeader";
import { LocationSection } from "../../../components/common/LocationSection";
import { instituteSchema, type InstituteFormValues } from "../instituteSchema";
import { TextBox } from "../../../components/common/TextBox";
import { RadioGroup } from "../../../components/common/RadioGroup";
import { CheckBox } from "../../../components/common/CheckBox";
import {
  createInstitute,
  updateInstitute,
  getInstituteById,
  getInstitutePlans,
  getAccountHistory,
  updateAccountHistory,
  getAccountHistoryById,
} from "../instituteService";
import { CustomDatePicker } from "../../../components/common/CustomDatePicker";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Select } from "@radix-ui/react-select";
import { Dropdown } from "../../../components/common/Select";
import {
  fetchCities,
  fetchCountries,
  fetchStates,
} from "../../../services/locationService";
import { FormSkeleton } from "../../../components/common/FormSkeleton";
import { Button } from "../../../components/common/Button";
import {
  FormModal,
  ModalFieldConfig,
} from "../../../components/common/FormModal";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../redux/slices/errorSlice";
import ValidationErrorSummary from "../../../components/common/ValidationErrorSummary";
type AddInstituteProps = {
  mode: "add" | "edit";
};

const DEFAULT_VALUES: InstituteFormValues = {
  regDate: new Date().toISOString().split("T")[0],
  instituteShortCode: "",
  parentCompanyName: "",
  instituteName: "",
  address: "",
  pinCode: "",
  phone: "",
  email: "",
  noOfStudents: 0,
  instProCoachingFor: "",
  salesPersonName: "",
  isInternalUse: false,
  logo: "",
  logoPath: "",
  instituteType: 1,
  instituteStatus: 1,
  instituteExpiryDate: "",
  isAllowStudModule: false,
  isAllowedAndroidApp: false,
  isAllowTestEngine: false,
  contactPerson: "",
  cpMobile: "",
  cpEmail: "",
  countryId: 0,
  stateId: 0,
  cityId: 0,
  otherCity: undefined,
  institutePlanId: 0,
  subscription: {
    subscriptionType: "2",
    startDate: "",
    endDate: "",
    noOfDays: 0,
    noOfRegStudents: 0,
    noOfEnquiry: 0,
    noOfBranches: 0,
    planStatus: 0,
  },
};

const accountHistoryColumns: TableColumn<AccountHistoryDto>[] = [
  { key: "purchaseDate", header: "Purchase Date" },
  { key: "type", header: "Plan Type" },
  { key: "startDate", header: "Start Date" },
  { key: "endDate", header: "End Date" },
  { key: "days", header: "Days", align: "center" },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (row) => `$${row.amount.toFixed(2)}`,
  },
  {
    key: "isActive",
    header: "Status",
    align: "center",
    render: (row) => {
      const statusConfig: Record<number, { label: string; className: string }> =
        {
          1: {
            label: "Active",
            className: "bg-green-100 text-green-800 border-green-200",
          },
          0: {
            label: "Inactive",
            className: "bg-red-100 text-red-800 border-red-200",
          },
          2: {
            label: "Hold",
            className: "bg-amber-100 text-amber-800 border-amber-200",
          },
          3: {
            label: "Blocked",
            className: "bg-gray-100 text-gray-800 border-gray-200",
          },
        };

      const status = statusConfig[row.isActive] ?? {
        label: "Unknown",
        className: "bg-gray-100 text-gray-600 border-gray-200",
      };

      return (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}
        >
          {status.label}
        </span>
      );
    },
  },
];

// 💡 FIX 1: Moved OUTSIDE the component so its object reference stays static across renders
// const accountHistoryFields: ModalFieldConfig<AccountHistoryDto>[] = [
//   { key: "purchaseDate", label: "Purchase Date", type: "readonly" },
//   { key: "startDate", label: "Start Date", type: "date", required: true },
//   { key: "endDate", label: "End Date", type: "date", required: true },
//   { key: "type", label: "Subscription Type", type: "readonly" },
//   { key: "days", label: "No. of Days", type: "readonly" },
//   { key: "noOfBranches", label: "No. of branches", type: "readonly" },
//   {
//     key: "amount",
//     label: "Amount",
//     type: "readonly",
//     render: (row) => `₹${(row.amount ?? 0).toFixed(2)}`,
//   },
//   {
//     key: "remarks",
//     label: "Remarks",
//     type: "textarea",
//     placeholder: "Enter remarks",
//   },
//   {
//     key: "isActive",
//     label: "Status",
//     type: "select",
//     options: [
//       { label: "Inactive", value: 0 },
//       { label: "Active", value: 1 },
//       { label: "Hold", value: 2 },
//       { label: "Blocked", value: 3 },
//     ],
//   },
// ];
// 💡 Replace static accountHistoryFields array with this function:
const getAccountHistoryFields = (
  type?: string,
): ModalFieldConfig<AccountHistoryDto>[] => {
  const isBranchWise = type === "Branch Wise";
  const isStudentWise = type === "Student Wise";

  const fields: ModalFieldConfig<AccountHistoryDto>[] = [
    { key: "purchaseDate", label: "Purchase Date", type: "readonly" },
    { key: "startDate", label: "Start Date", type: "date", required: true },
    { key: "endDate", label: "End Date", type: "date", required: true },
    { key: "type", label: "Subscription Type", type: "readonly" },
    { key: "days", label: "No. of Days", type: "readonly" },
  ];

  // Show "No. of Branches" ONLY for Branch Wise
  if (isBranchWise) {
    fields.push({
      key: "noOfBranches",
      label: "No. of Branches",
      type: "readonly",
    });
  }

  // Show "No. of Register" & "No. of Enquiry" ONLY for Student Wise
  if (isStudentWise) {
    fields.push(
      { key: "noOfStudents", label: "No. of Register", type: "readonly" },
      { key: "noOfEnquiry", label: "No. of Enquiry", type: "readonly" },
    );
  }

  fields.push(
    {
      key: "amount",
      label: "Amount",
      type: "readonly",
      render: (row) => `₹${(row?.amount ?? 0).toFixed(2)}`,
    },
    {
      key: "remark",
      label: "Remarks",
      type: "textarea",
      placeholder: "Enter remarks",
    },
    {
      key: "isActive",
      label: "Status",
      type: "select",
      options: [
        { label: "Inactive", value: 0 },
        { label: "Active", value: 1 },
        { label: "Hold", value: 2 },
        { label: "Blocked", value: 3 },
      ],
    },
  );

  return fields;
};
export default function AddInstitute({ mode }: AddInstituteProps) {
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 💡 FIX 2: All useState & custom hooks MUST be declared at the top of the component
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [sameAsAbove, setSameAsAbove] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { ipLocation } = useSelector((state: any) => state.location || {});
  const [showPurchasePlan, setShowPurchasePlan] = useState<boolean>(!isEdit);
  const [planOptions, setPlanOptions] = useState<
    { label: string; value: number | string }[]
  >([]);
  const [accountHistory, setAccountHistory] = useState<AccountHistoryDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] =
    useState<AccountHistoryDto | null>(null);

  const methods = useForm<InstituteFormValues>({
    resolver: zodResolver(instituteSchema) as any,
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const { register, handleSubmit, setValue, getValues, trigger, reset, watch } =
    methods;

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return "";

    // Remove time portion if present (e.g., "25/08/2026 00:00:00" or ISO strings)
    const cleanStr = dateStr.includes(" ")
      ? dateStr.split(" ")[0]
      : dateStr.split("T")[0];
    // 1;

    // Handles DD/MM/YYYY format returned by backend
    if (cleanStr.includes("/")) {
      const parts = cleanStr.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Output required for HTML <input type="date">: YYYY-MM-DD
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }

    return cleanStr;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getInstitutePlans();
        const plansList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        if (plansList.length > 0) {
          const formatted = plansList.map(
            (plan: { id: number; name: string }) => ({
              label: plan.name,
              value: String(plan.id),
            }),
          );

          setPlanOptions([
            // { label: "Select Institute Plan", value: 0 },
            ...formatted,
          ]);
        }
      } catch (error) {
        console.error("Failed to load plans:", error);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchInstituteDetails = async () => {
      try {
        setLoading(true);
        const res = await getInstituteById(id);

        if (res?.data) {
          const apiData = res.data;
          let countryName = "";
          let stateName = "";
          let cityName = "";
          if (apiData.countryId) {
            const countriesList = await fetchCountries();
            const foundCountry = countriesList.find(
              (c: any) => Number(c.id) === Number(apiData.countryId),
            );
            countryName = foundCountry ? foundCountry.name : "";
          }

          if (apiData.countryId && apiData.stateId) {
            const statesList = await fetchStates(Number(apiData.countryId));
            const foundState = statesList.find(
              (s: any) => Number(s.id) === Number(apiData.stateId),
            );
            stateName = foundState ? foundState.name : "";
          }

          if (apiData.stateId && apiData.cityId) {
            const citiesList = await fetchCities(Number(apiData.stateId));
            const foundCity = citiesList.find(
              (c: any) => Number(c.id) === Number(apiData.cityId),
            );
            cityName = foundCity ? foundCity.name : "";
          }

          reset({
            regDate: formatDateForInput(apiData.regDate),
            instituteShortCode: apiData.instituteShortCode || "",
            parentCompanyName: apiData.parentCompanyName || "",
            instituteName: apiData.instituteName || "",
            address: apiData.address || "",
            countryId: apiData.countryId ? Number(apiData.countryId) : 0,
            country: countryName,
            stateId: apiData.stateId ? Number(apiData.stateId) : 0,
            state: stateName,
            cityId: apiData.cityId ? Number(apiData.cityId) : 0,
            city: cityName,
            otherCity: apiData.otherCity || "",
            pinCode: apiData.pinCode || apiData.pincode || "",
            phone: apiData.phone || "",
            email: apiData.email || "",
            contactPerson: apiData.contactPerson || "",
            cpMobile: apiData.cpMobile || "",
            cpEmail: apiData.cpEmail || "",
            noOfStudents: apiData.noOfStudents || 0,
            instProCoachingFor: apiData.instProCoachingFor || "",
            remarks: apiData.remarks || "",
            salesPersonName: apiData.salesPersonName || "",
            isInternalUse: Boolean(apiData.isInternalUse),
            isAllowStudModule: Boolean(apiData.isAllowStudModule),
            isAllowedAndroidApp: Boolean(apiData.isAllowedAndroidApp),
            isAllowTestEngine: Boolean(apiData.isAllowTestEngine),
            logo: apiData.logo || "",
            logoPath: apiData.logoPath || "",
            instituteType: Number(apiData?.instituteType) || 1,
            instituteStatus:
              apiData.instituteStatus !== undefined
                ? Number(apiData.instituteStatus)
                : 1,
            instituteExpiryDate: formatDateForInput(
              apiData.instituteExpiryDate,
            ),
            institutePlanId: Number(apiData?.institutePlanId || 0),
            subscription: apiData.subscription
              ? {
                  subscriptionType: apiData.subscription.subscriptionType || "",
                  startDate: apiData.subscription.startDate
                    ? apiData.subscription.startDate.split("T")[0]
                    : "",
                  endDate: apiData.subscription.endDate
                    ? apiData.subscription.endDate.split("T")[0]
                    : "",
                  noOfDays: Number(apiData.subscription.noOfDays || 0),
                  noOfRegStudents: Number(
                    apiData.subscription.noOfRegisteredStudents || 0,
                  ),
                  noOfEnquiry: Number(
                    apiData.subscription.noOfEnquiryStudents || 0,
                  ),
                  noOfBranches: Number(apiData.subscription.noOfBranches || 0),
                  planStatus: Number(apiData.subscription.planStatus || 0),
                }
              : undefined,
          });

          if (apiData.logo) {
            setLogoPreview(`data:image/png;base64,${apiData.logo}`);
          }
        }
      } catch (error: any) {
        // toast.error(
        //   error?.response?.data?.message || "Failed to load institute details.",
        // );
      } finally {
        setLoading(false);
      }
    };

    fetchInstituteDetails();
  }, [id, isEdit, reset]);

  useEffect(() => {
    if (isEdit) return;
    if (ipLocation) {
      if (ipLocation.countryId && ipLocation.countryId > 0) {
        setValue("countryId", Number(ipLocation.countryId), {
          shouldValidate: true,
        });
      }
      if (ipLocation.stateId && ipLocation.stateId > 0) {
        setValue("stateId", Number(ipLocation.stateId), {
          shouldValidate: true,
        });
      }
      if (ipLocation.cityId && ipLocation.cityId > 0) {
        setValue("cityId", Number(ipLocation.cityId), { shouldValidate: true });
      }
    }
  }, [ipLocation, isEdit, setValue]);

  useEffect(() => {
    if (!showPurchasePlan) {
      setValue("institutePlanId", 0);
      setValue("subscription", undefined);
    }
  }, [showPurchasePlan, setValue]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024) {
        toast.error("Logo size should not be greater than 100 KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setValue("logo", base64String.split(",")[1] || base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSameAsAbove = async (checked: boolean) => {
    setSameAsAbove(checked);
    if (checked) {
      setValue("cpMobile", getValues("phone") || "", { shouldValidate: true });
      setValue("cpEmail", getValues("email") || "", { shouldValidate: true });
    } else {
      setValue("cpMobile", "");
      setValue("cpEmail", "");
    }
    await trigger(["cpMobile", "cpEmail"]);
  };

  const onSubmit: SubmitHandler<InstituteFormValues> = async (data) => {
    try {
      const payload = {
        ...(isEdit && id ? { instituteId: Number(id) } : {}),
        regDate: data.regDate,
        instituteShortCode: data.instituteShortCode?.trim() || undefined,
        parentCompanyName: data.parentCompanyName?.trim() || undefined,
        instituteName: data.instituteName.trim(),
        address: data.address.trim(),
        countryId: Number(data.countryId),
        stateId: Number(data.stateId),
        cityId: Number(data.cityId),
        otherCity: data.otherCity?.trim() || undefined,
        pinCode: data.pinCode ?? "",
        phone: data.phone?.trim() || undefined,
        email: data.email.trim(),
        contactPerson: data.contactPerson.trim(),
        cpMobile: data.cpMobile.trim(),
        cpEmail: data.cpEmail.trim(),
        noOfStudents: data.noOfStudents ? Number(data.noOfStudents) : 0,
        instProCoachingFor: data.instProCoachingFor ?? "",
        remarks: data.remarks?.trim() || undefined,
        salesPersonName: data.salesPersonName?.trim() || undefined,
        isInternalUse: Boolean(data.isInternalUse),
        isAllowStudModule: Boolean(data.isAllowStudModule),
        isAllowedAndroidApp: Boolean(data.isAllowedAndroidApp),
        isAllowTestEngine: Boolean(data.isAllowTestEngine),
        logo: data.logo || undefined,
        logoPath: data.logoPath || undefined,
        instituteType: Number(data.instituteType ?? 1),
        instituteStatus:
          data.instituteStatus !== undefined ? Number(data.instituteStatus) : 1,
        instituteExpiryDate: data.instituteExpiryDate || undefined,
        institutePlanId: Number(data.institutePlanId || 0),
        ...(data.subscription && {
          subscription: {
            subscriptionType: data.subscription.subscriptionType || undefined,
            startDate: data.subscription.startDate || undefined,
            endDate: data.subscription.endDate || undefined,
            noOfDays: Number(data.subscription.noOfDays || 0),
            noOfRegStudents: Number(data.subscription.noOfRegStudents || 0),
            noOfEnquiry: Number(data.subscription.noOfEnquiry || 0),
            noOfBranches: Number(data.subscription.noOfBranches || 0),
            planStatus: data.subscription.planStatus ? 1 : 0,
          },
        }),
      };
      console.log("Payload data : ", payload);
      if (isEdit) {
        await updateInstitute(Number(id), payload);
        toast.success("Institute updated successfully");
      } else {
        await createInstitute(payload);
        toast.success("Institute added successfully");
      }
      navigate("/subscription/manage-institutes");
    } catch (error: any) {
      // toast.error(
      //   error?.response?.data?.message || "Failed to submit institute details",
      // );
    }
  };

  const startDate = watch("subscription.startDate");
  const endDate = watch("subscription.endDate");
  const isplanActive = watch("subscription.planStatus");

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        setValue("subscription.noOfDays", diffDays, { shouldValidate: true });
      } else {
        setValue("subscription.noOfDays", 0, { shouldValidate: true });
      }
    }
  }, [startDate, endDate, setValue]);

  const subscriptionPlan = watch("subscription.subscriptionType");

  useEffect(() => {
    if (subscriptionPlan === "2") {
      setValue("subscription.noOfBranches", 0, { shouldValidate: true });
      setValue("subscription.noOfRegStudents", 0, { shouldValidate: true });
      setValue("subscription.noOfEnquiry", 0, { shouldValidate: true });
    } else if (subscriptionPlan === "1") {
      setValue("subscription.noOfRegStudents", 0, { shouldValidate: true });
      setValue("subscription.noOfEnquiry", 0, { shouldValidate: true });
    } else if (subscriptionPlan === "0") {
      setValue("subscription.noOfBranches", 0, { shouldValidate: true });
    }
  }, [subscriptionPlan, setValue]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const fetchHistory = useCallback(async () => {
    if (!isEdit || !id) return;

    try {
      setHistoryLoading(true);

      const payload: AccountHistorySearchDto = {
        instId: Number(id),
        pageNumber: 1,
        pageSize: 10,
        planName: "",
        searchStatus: "",
      };

      const res = await getAccountHistory(payload);

      const historyData =
        res?.data?.items ||
        (Array.isArray(res?.data) ? res.data : []) ||
        (Array.isArray(res) ? res : []);

      setAccountHistory(historyData);
      setShowPurchasePlan(historyData.length === 0);
    } catch (error) {
      console.error("Failed to load account history:", error);
      setAccountHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [id, isEdit]);
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  const handleEditHistory = async (record: AccountHistoryDto) => {
    try {
      // 1. Fetch single detailed history record if needed or use record directly
      const res = await getAccountHistoryById(record.paymentHistoryId);
      const apiData = res?.data || record;

      // 2. Map and format all properties explicitly
      const formattedRecord: AccountHistoryDto = {
        ...apiData,
        days: apiData.days ?? 0,
        type: apiData.type || "N/A",
        noOfBranches: apiData.noOfBranches ?? 0,
        noOfStudents: apiData.noOfStudents ?? 0,
        noOfEnquiry: apiData.noOfEnquiry ?? 0,
        startDate: formatDateForInput(apiData.startDate),
        endDate: formatDateForInput(apiData.endDate),
        remark: apiData.remark || "",
      };

      setSelectedHistory(formattedRecord);
      setIsHistoryModalOpen(true);
    } catch (error) {
      toast.error("Failed to load details");
    }
  };

  const historyTableColumns: TableColumn<AccountHistoryDto>[] = [
    {
      key: "actions",
      header: "ACTIONS",
      align: "center",
      render: (row) => {
        // 🎯 Check if status is 1 (Active), 2 (Hold), or 3 (Blocked)
        const isEditable = [1, 2, 3].includes(Number(row.isActive));

        return (
          <div className="flex items-center justify-center gap-2">
            {isEditable ? (
              <button
                type="button"
                onClick={() => handleEditHistory(row)}
                className="text-[#0F4C81] hover:text-[#0c3d6a] transition-colors p-1"
                title="Edit Record"
              >
                <SquarePen className="w-4 h-4" />
              </button>
            ) : (
              // Renders empty string / nothing when status is 0 or any other value
              "-"
            )}
          </div>
        );
      },
    },
    { key: "purchaseDate", header: "PURCHASE DATE" },
    { key: "startDate", header: "START DATE" },
    { key: "endDate", header: "END DATE" },
    { key: "type", header: "SUBSCRIPTION TYPE" },
    { key: "noOfBranches", header: "  No.of Branches", align: "center" },
    { key: "noOfStudents", header: "  No.of Registrations", align: "center" },
    { key: "noOfEnquiry", header: " No.of Enquiry", align: "center" },
    {
      key: "amount",
      header: "Price",
      align: "center",
      render: (row) => `₹${(row.amount ?? 0).toFixed(2)}`,
    },
    {
      key: "isActive",
      header: "STATUS",
      align: "center",
      render: (row) => {
        const statusConfig: Record<
          number,
          { label: string; className: string }
        > = {
          1: {
            label: "Active",
            className: "bg-green-100 text-green-800 border-green-200",
          },
          0: {
            label: "Inactive",
            className: "bg-red-100 text-red-800 border-red-200",
          },
          2: {
            label: "Hold",
            className: "bg-amber-100 text-amber-800 border-amber-200",
          },
          3: {
            label: "Blocked",
            className: "bg-gray-100 text-gray-800 border-gray-200",
          },
        };

        const status = statusConfig[row.isActive] ?? {
          label: "Unknown",
          className: "bg-gray-100 text-gray-600 border-gray-200",
        };

        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}
          >
            {status.label}
          </span>
        );
      },
    },
  ];

  // 💡 FIX 3: Conditional early return happens ONLY AFTER all hooks are instantiated above
  if (isEdit && loading) {
    return <FormSkeleton fieldsCount={12} columns={3} showTitle={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Manage Institutes"
        description="Configure institute details, settings, and permissions"
        extraBreadcrumbs={[
          { label: isEdit ? "Edit Institute" : "Add Institute" },
        ]}
      />

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.error("Form Validation Errors:", errors);
            // toast.error("Please fill in all required fields correctly.");
          })}
          className="px-6 pb-6 space-y-5"
        >
          {/* SECTION 1: Institute Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#0F4C81]" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                Institute Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomDatePicker
                name="regDate"
                label="Date Of Registration"
                required
              />
              <TextBox
                name="instituteShortCode"
                label="Institute Short Code"
                placeholder="Enter Short Code"
                required={false}
                allowOnly="alphanumeric"
                maxLength={15}
              />
              <TextBox
                name="parentCompanyName"
                label="Parent Company Name"
                placeholder="Enter Parent Company Name"
                required={false}
                allowOnly="noSpecialChars"
                maxLength={100}
              />

              <TextBox
                name="instituteName"
                label="Name of Institute"
                placeholder="Enter Name of Institute"
                required
                allowOnly="noSpecialChars"
                maxLength={50}
              />
              <TextBox
                name="phone"
                label="Mobile"
                placeholder="Enter Phone Number"
                required={false}
                allowOnly={"numeric"}
                maxLength={16}
              />

              <TextBox
                name="email"
                label="Email ID"
                placeholder="Enter Email ID"
                required
                type="email"
                maxLength={45}
              />

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 [&>:last-child]:md:col-span-3">
                <LocationSection />
              </div>

              <TextBox
                name="pinCode"
                label="Pin Code"
                placeholder="Enter Pin Code"
                required={false}
                allowOnly={"numeric"}
                maxLength={6}
              />
              <div className="md:col-span-2">
                <TextBox
                  name="address"
                  label="Address"
                  placeholder="Enter Address"
                  required
                  allowOnly="address"
                  maxLength={200}
                />
              </div>
              <TextBox
                name="noOfStudents"
                label="Number Of Students"
                placeholder="Enter Number Of Students"
                required={false}
                allowOnly={"numeric"}
                maxLength={6}
              />
              <TextBox
                name="instProCoachingFor"
                label="We Provide Coaching For"
                placeholder="e.g. Law, Medical, Engineering"
                required={false}
                allowOnly="address"
                maxLength={100}
              />
              <TextBox
                name="salesPersonName"
                label="Sales Person Name"
                placeholder="Enter Sales Person Name"
                required={false}
                allowOnly="address"
                maxLength={100}
              />

              <RadioGroup
                name="isInternalUse"
                label="Internal Use"
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Logo
                </label>
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Choose File
                  </button>
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="h-10 max-w-[120px] object-contain border rounded p-1"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">
                      No file chosen
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-gray-400">
                  Logo Size (200px X 85px) Or File size &le; 100 kb.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#0F4C81]" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                Institute Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomDatePicker
                name="instituteExpiryDate"
                label="Expiry Date"
                required={false}
              />
              <RadioGroup
                name="instituteType"
                label="Type"
                options={[
                  { label: "Premium", value: 1 },
                  { label: "Trial", value: 2 },
                ]}
              />

              <RadioGroup
                name="instituteStatus"
                label="Status"
                options={[
                  { label: "Active", value: 1 },
                  { label: "Inactive", value: 0 },
                ]}
              />

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <CheckBox
                  name="isAllowStudModule"
                  label="Allow Student Module"
                />
                <CheckBox
                  name="isAllowedAndroidApp"
                  label="Android App for Parents"
                />
                <CheckBox name="isAllowTestEngine" label="Online Test Engine" />
              </div>
            </div>
          </div>

          {/* SECTION 3: Edit Mode Modules */}
          {isEdit && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                  <History className="w-4 h-4 text-[#0F4C81]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    Account History
                  </h2>
                  <p className="text-xs text-gray-400">
                    Historical transaction logs and plan subscription records
                  </p>
                </div>
              </div>

              {historyLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading account history...
                </div>
              ) : (
                <DataTable
                  columns={historyTableColumns}
                  data={accountHistory}
                  rowKey="paymentHistoryId"
                  emptyMessage="No account history records found."
                />
              )}
            </div>
          )}

          {/* Institute Plan Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[#0F4C81]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    Institute Plan
                  </h2>
                  <p className="text-xs text-gray-400">
                    Enable or manage purchase subscription details
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600">
                  New Plan
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showPurchasePlan}
                  onClick={() => setShowPurchasePlan((prev) => !prev)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 select-none ${
                    showPurchasePlan ? "bg-[#0F4C81]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      showPurchasePlan ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {showPurchasePlan && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CustomDatePicker
                    name="subscription.startDate"
                    label="Start Date"
                    required
                  />
                  <CustomDatePicker
                    name="subscription.endDate"
                    label="End Date"
                    required
                  />
                  <TextBox
                    name="subscription.noOfDays"
                    label="No. of Days"
                    placeholder="No. of Days"
                    required={false}
                    allowOnly="numeric"
                    maxLength={10}
                    disabled={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Dropdown
                    name="institutePlanId"
                    label="Institute Plan"
                    options={planOptions}
                    required
                  />
                  <RadioGroup
                    name="subscription.subscriptionType"
                    label="Subscription Plan"
                    options={[
                      { label: "Trial", value: "2" },
                      { label: "Branch Wise", value: "1" },
                      { label: "Student Wise", value: "0" },
                    ]}
                  />
                  <div className="flex flex-col pt-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Status
                    </label>
                    <CheckBox
                      name="subscription.planStatus"
                      label="Mark as Active"
                    />
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    subscriptionPlan === "1" || subscriptionPlan === "0"
                      ? "max-h-[120px] opacity-100 pt-1 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    {subscriptionPlan === "1" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextBox
                          name="subscription.noOfBranches"
                          label="No. of Branches"
                          placeholder="Enter No. of Branches"
                          required
                          allowOnly="numeric"
                          maxLength={10}
                        />
                      </div>
                    )}

                    {subscriptionPlan === "0" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextBox
                          name="subscription.noOfRegStudents"
                          label="No. of Registered Students"
                          placeholder="Enter Registered Students"
                          required
                          allowOnly="numeric"
                          maxLength={10}
                        />
                        <TextBox
                          name="subscription.noOfEnquiry"
                          label="No. of Enquiry Students"
                          placeholder="Enter Enquiry Students"
                          required
                          allowOnly="numeric"
                          maxLength={10}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isEdit && isplanActive
                      ? "grid-rows-[1fr] opacity-100 mt-2"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                      <span className="font-semibold flex-shrink-0">Note:</span>
                      <span>
                        Activating this plan will automatically deactivate any
                        currently active plan for this institute.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Contact Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-[#0F4C81]" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                Contact Person Details
              </h2>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={sameAsAbove}
                onChange={(e) => handleSameAsAbove(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#0f4c81] focus:ring-[#0f4c81] cursor-pointer"
              />
              <span className="text-sm text-gray-600">Same as above</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextBox
                name="contactPerson"
                label="Contact Person"
                placeholder="Enter Contact Person"
                required
                allowOnly="address"
                maxLength={45}
              />
              <TextBox
                name="cpMobile"
                label="Mobile"
                placeholder="Enter Mobile"
                required
                allowOnly={"numeric"}
                maxLength={16}
              />
              <TextBox
                name="cpEmail"
                label="Email ID"
                placeholder="Enter Email ID"
                required
                type="email"
                maxLength={45}
              />
            </div>
          </div>

          {/* Actions */}
          <ValidationErrorSummary />
          <div className="flex items-center gap-3 pt-2">
            <Button preset={isEdit ? "update" : "save"}></Button>
            <Button
              type="button"
              preset="cancel"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate("/subscription/manage-institutes");
              }}
            />
          </div>
        </form>
      </FormProvider>

      <FormModal<AccountHistoryDto>
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Confirmation Message"
        record={selectedHistory}
        fields={getAccountHistoryFields(selectedHistory?.type)}
        onSave={async (formData) => {
          if (!selectedHistory?.paymentHistoryId) return;

          const payload = {
            paymentHistoryId: selectedHistory.paymentHistoryId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            remark: formData.remark,
            isActive: Number(formData.isActive),
            days: Number(formData.days),
          };

          const startDateStr = payload["startDate"];
          const endDateStr = payload["endDate"];

          // 1. Date Validation
          if (startDateStr && endDateStr) {
            const start = new Date(startDateStr);
            const end = new Date(endDateStr);

            if (start > end) {
              toast.error("Start Date cannot be greater than End Date.");
              // Throwing an error stops FormModal from running onClose()
              throw new Error("Validation failed: Start Date > End Date");
            }
          }

          // 2. Call API endpoint inside try block
          try {
            await updateAccountHistory(
              selectedHistory.paymentHistoryId,
              payload,
            );

            setAccountHistory((prevList) =>
              prevList.map((item) =>
                item.paymentHistoryId === selectedHistory.paymentHistoryId
                  ? { ...item, ...payload }
                  : item,
              ),
            );

            toast.success("Account history updated successfully!");
            fetchHistory();
          } catch (error: any) {
            toast.error(
              error?.response?.data?.message || "Failed to update history",
            );
            // Re-throw API error so FormModal handles its submitting state properly
            throw error;
          }
        }}
      />
    </div>
  );
}
