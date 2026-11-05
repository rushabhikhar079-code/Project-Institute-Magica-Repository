import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CheckCircle,
  X,
  Save,
  Trash2,
  Upload,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";

import {
  getBranchById,
  updateBranch,
  addnewBranch,
  deleteBranch,
} from "../branchService";
import { fetchUserIpLocation } from "../../../services/locationService"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import { LocationSection } from "../../../components/common/LocationSection";

import { EMPTY_BRANCH, inp, lbl } from "../constants";

import {
  branchSchema,
  type BranchFormValidation,
} from "../validations/BranchSchema";
import { BranchForm, BranchCourse, CourseGroup } from "../branchTypes";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import ValidationErrorSummary from "../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../redux/slices/errorSlice";
type AddBranchProps = {
  mode: "add" | "edit";
};
type BranchOutletContext = {
  resetBranchPagination: () => Promise<void>;
};

const DEFAULT_FORM_VALUES: BranchFormValidation = {
  name: "",
  code: "",
  address: "",

  country: "India",
  countryId: 1,

  state: "",
  stateId: 0,

  city: "",
  cityId: 0,
  pinCode: "",
  phone: "",
  email: "",

  taxRate: "",
  makeFranchisee: 0,

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
  agreementFileChanged: false,

  otherCity: "",
};

export default function AddBranch({ mode }: AddBranchProps) {
  const isEdit = mode === "edit";
  const { resetBranchPagination } = useOutletContext<BranchOutletContext>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const branchId = id ? Number(id) : undefined;
  const [sameAsAbove, setSameAsAbove] = useState(false);
  const [branchNameForDelete, setBranchNameForDelete] = useState("");
  const [originalFranchiseFlag, setOriginalFranchiseFlag] = useState<
    number | null
  >(null);

  const [franchiseFile, setFranchiseFile] = useState<string | null>(null);
  const [courses, setCourses] = useState<BranchCourse[]>([]);
  const [amountCourses, setAmountCourses] = useState<CourseGroup[]>([]);
  const [commissionCourses, setCommissionCourses] = useState<CourseGroup[]>([]);

  const franchiseFileRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const methods = useForm<BranchFormValidation>({
    resolver: zodResolver(branchSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    getValues,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = methods;
  const makeFranchisee = watch("makeFranchisee");

  const isFranchise = makeFranchisee === 1;

  const showFranchiseSection = !isEdit || originalFranchiseFlag === 1;
  const branchName = watch("name");
  const buildCourseGroups = (
    courses: BranchCourse[],
    type: "amount" | "commission",
  ): CourseGroup[] => {
    return courses.map((course) => ({
      id: `${type}-${course.courseId}`,
      title: `Course: ${course.courseName}`,
      hasTax: false,
      valueLabel: type === "amount" ? "Amount" : "Commission (%)",

      subjects: course.subjects.map((subject) => {
        const value =
          type === "amount" ? subject.totalFees : subject.commission;

        return {
          id: `${type}-${subject.subId}`,
          name: subject.subName,
          fees: subject.fees,

          // Checkbox is checked if this section has a saved value
          selected: Number(value) > 0,

          // Show saved value in the input
          value: Number(value) > 0 ? String(value) : "",
        };
      }),
    }));
  };
  const handleValueChange = (
    sectionSetter: React.Dispatch<React.SetStateAction<CourseGroup[]>>,
    courseId: string,
    subjectId: string,
    value: string,
  ) => {
    sectionSetter((prev) =>
      prev.map((course) => {
        if (course.id !== courseId) return course;

        return {
          ...course,
          subjects: course.subjects.map((sub) =>
            sub.id === subjectId ? { ...sub, value } : sub,
          ),
        };
      }),
    );
  };
  const toggleSelect = (
    sectionSetter: React.Dispatch<React.SetStateAction<CourseGroup[]>>,
    courseId: string,
    subjectId: string,
  ) => {
    sectionSetter((prev) =>
      prev.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          subjects: course.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  selected: !subject.selected,
                }
              : subject,
          ),
        };
      }),
    );
  };
  const renderCourseTable = (
    groups: CourseGroup[],
    setGroup: React.Dispatch<React.SetStateAction<CourseGroup[]>>,
  ) => (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-2 flex items-center justify-between bg-[#0f4c81]">
            <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
              {group.title}
            </h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider h-8">
                  <th className="px-3 w-14 text-center">Select</th>

                  <th className="px-3">Subject</th>

                  <th className="px-3 text-right w-28">Fees</th>

                  <th className="px-3 text-right w-36">{group.valueLabel}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {group.subjects.map((subject, index) => (
                  <tr
                    key={subject.id}
                    className={`h-8 transition-colors ${
                      subject.selected
                        ? "bg-blue-50/30"
                        : index % 2 === 1
                          ? "bg-[#e0eef5]/30 hover:bg-[#e0eef5]/60"
                          : "bg-white hover:bg-[#e0eef5]/60"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 w-14 text-center">
                      <input
                        type="checkbox"
                        checked={subject.selected}
                        onChange={() =>
                          toggleSelect(setGroup, group.id, subject.id)
                        }
                        className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer align-middle"
                      />
                    </td>

                    {/* Subject */}
                    <td className="px-3 font-medium text-slate-800 truncate">
                      {subject.name}
                    </td>

                    {/* Fees */}
                    <td className="px-3 text-right font-mono text-slate-600 w-28">
                      {subject.fees.toLocaleString("en-IN")}
                    </td>

                    {/* Amount / Commission */}
                    <td className="px-3 text-right w-36">
                      <input
                        type="text"
                        min="0"
                        step="0.01"
                        disabled={!subject.selected}
                        value={subject.value}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          let value = e.target.value;

                          if (value === "") {
                            handleValueChange(
                              setGroup,
                              group.id,
                              subject.id,
                              value,
                            );
                            return;
                          }

                          if (!/^\d+(\.\d{0,2})?$/.test(value)) {
                            return;
                          }

                          let numericValue = Number(value);

                          if (
                            group.valueLabel
                              .toLowerCase()
                              .includes("commission")
                          ) {
                            if (numericValue > 100) {
                              value = "100";
                            }
                          }

                          if (
                            group.valueLabel.toLowerCase().includes("amount")
                          ) {
                            if (numericValue > 10000000) {
                              value = "10000000";
                            }
                          }

                          if (Number(value) <= 0) {
                            return;
                          }

                          handleValueChange(
                            setGroup,
                            group.id,
                            subject.id,
                            value,
                          );
                        }}
                        placeholder={subject.selected ? "0" : "—"}
                        className="w-24 text-right px-2 py-0.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
  useEffect(() => {
    if (!isEdit || !branchId) {
      return;
    }

    const loadBranch = async () => {
      try {
        const response = await getBranchById(branchId);
        const data = response.data;
        console.log("FULL RESPONSE:", response);
        console.log("RESPONSE.DATA:", response.data);
        console.log("RESPONSE.DATA.COURSES:", response.data?.courses);

        console.log("EDIT BRANCH DATA:", data);
        const branchStatus = Number(data.status) === 1 ? "Active" : "Inactive";
        const franchiseFlag = Number(data.makeFranchisee ?? 0);

        setOriginalFranchiseFlag(franchiseFlag);

        console.log("API status:", data.status);
        console.log("Mapped status:", branchStatus);

        const apiCourses = data.courses ?? [];

        setCourses(apiCourses);

        setAmountCourses(buildCourseGroups(apiCourses, "amount"));

        setCommissionCourses(buildCourseGroups(apiCourses, "commission"));
        reset({
          name: data.branchName ?? "",
          code: data.branchCode ?? "",
          address: data.address ?? "",

          country: data.country ?? "",
          countryId: data.countryId ?? 0,

          state: data.state ?? "",
          stateId: data.stateId ?? 0,

          city: data.cityId === 0 ? "Other" : (data.city ?? ""),
          cityId: data.cityId ?? 0,
          otherCity: data.otherCity ?? "",
          pinCode: data.pinCode ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",

          taxRate: String(data.taxRate ?? ""),

          makeFranchisee: franchiseFlag, // HERE
          status: branchStatus,
          contactName: data.contactPerson ?? "",
          contactMobile: data.cpMobile ?? "",
          contactEmail: data.cpEmail ?? "",

          // Franchisee fields
          signUpDate: data.regDate ? data.regDate.split("T")[0] : "",
          signUpAmount: String(data.signUp_Amt ?? ""),
          monthlyFee: String(data.monthly_Fee ?? ""),
          testFee: String(data.exam_Fee ?? ""),
          certFee: String(data.certification_Fee ?? ""),
          feeCommission: String(data.commision_All ?? ""),
          fixedStudentFee: String(data.stud_Fixed_Fee ?? ""),

          // Agreement
          agreementFileName: data.agreementFileName ?? "",
          agreementFile: null,
          agreementFileChanged: false,
        });

        // Show saved agreement filename in UI
        setFranchiseFile(data.agreementFileName ?? null);

        // Reset UI-only states
        setSameAsAbove(false);
      } catch (error) {
        console.error("Failed to fetch branch details:", error);
        // toast.error("Failed to load branch details");
      }
    };

    loadBranch();
  }, [isEdit, branchId, reset]);
  useEffect(() => {
    console.log(" COURSES STATE UPDATED:", courses);
  }, [courses]);
  useEffect(() => {
    console.log("AMOUNT COURSES:", amountCourses);
  }, [amountCourses]);

  useEffect(() => {
    console.log("COMMISSION COURSES:", commissionCourses);
  }, [commissionCourses]);
  useEffect(() => {
    const initializeAddBranch = async () => {
      if (isEdit) return;

      // Start with blank location
      reset({
        ...DEFAULT_FORM_VALUES,
        country: "",
        countryId: 0,
        state: "",
        stateId: 0,
        city: "",
        cityId: 0,
      });

      console.log("🌍 Calling IP location API...");

      try {
        const location = await fetchUserIpLocation();

        console.log("🌍 IP LOCATION:", location);

        if (!location) {
          console.warn("❌ No IP location returned");
          return;
        }

        // TEMPORARY - inspect the actual response

        setValue("countryId", location.countryId ?? 0);

        setValue("stateId", location.stateId ?? 0);

        setValue("cityId", location.cityId ?? 0);
      } catch (error) {
        console.error("❌ IP location failed:", error);
      }
    };

    initializeAddBranch();
  }, [isEdit, reset, setValue]);
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

  const onSubmit = async (data: BranchFormValidation) => {
    console.log("FORM DATA:", data);

    try {
      // =========================
      // EDIT BRANCH
      // =========================
      if (isEdit) {
        if (!branchId) {
          toast.error("Branch ID is missing");
          return;
        }

        // Build subject-level fixed fees
        const course_Fixed_Fee = amountCourses.flatMap((course) =>
          course.subjects
            .filter((subject) => subject.selected && subject.value !== "")
            .map((subject) => ({
              subjectId: Number(subject.id.replace("amount-", "")),
              amount: Number(subject.value),
            })),
        );

        // Build subject-level commissions
        const coursewise_Commision = commissionCourses.flatMap((course) =>
          course.subjects
            .filter((subject) => subject.selected && subject.value !== "")
            .map((subject) => ({
              subjectId: Number(subject.id.replace("commission-", "")),
              commision: Number(subject.value),
            })),
        );

        console.log("COURSE FIXED FEES:", course_Fixed_Fee);
        console.log("COURSE COMMISSIONS:", coursewise_Commision);

        const response = await updateBranch(branchId, data, {
          course_Fixed_Fee,
          coursewise_Commision,
        });

        console.log("Branch updated successfully:", response);

        toast.success("Branch updated successfully");

        navigate("/managebranches", {
          state: {
            updatedBranchId: branchId,
          },
        });
        return;
      }

      // =========================
      // ADD BRANCH
      // =========================
      const response = await addnewBranch(data);

      console.log("Branch added successfully:", response);

      toast.success("Branch added successfully");

      await resetBranchPagination();
      navigate("/managebranches");
    } catch (error) {
      console.error(
        isEdit ? "Failed to update branch:" : "Failed to add branch:",
        error,
      );

      // toast.error(isEdit ? "Failed to update branch" : "Failed to add branch");
    }
  };
  const handleDelete = async () => {
    if (!branchId) {
      toast.error("Branch ID is missing");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${branchNameForDelete || branchName || "this branch"}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBranch(branchId);

      toast.success(
        `Branch deleted successfully: ${
          branchNameForDelete || branchName || "Branch"
        }`,
      );

      console.log(
        `Branch deleted successfully: ${
          branchNameForDelete || branchName || "Branch"
        }`,
      );

      navigate(-1);
    } catch (error) {
      console.error("Failed to delete branch:", error);
      // toast.error("Failed to delete branch");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Manage Branches"
        description="View and manage all branch locations"
        extraBreadcrumbs={[
          {
            label: isEdit
              ? `Edit Branch — ${branchName || "Branch"}`
              : "Add Branch",
          },
        ]}
      />

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("❌ VALIDATION ERRORS:", errors);
          })}
          className="px-6 pb-6 space-y-5"
        >
          {" "}
          {/* Breadcrumbs */}
          {/* Branch Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#0F4C81]" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                Branch Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>
                  Branch Name <span className="text-red-500">*</span>
                </label>{" "}
                <input
                  type="text"
                  {...register("name")}
                  className={inp}
                  placeholder="Enter branch name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className={lbl}>Branch Code</label>
                <input
                  type="text"
                  {...register("code")}
                  className={inp}
                  placeholder="Enter Branch Code"
                />

                {errors.code && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.code.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("address")}
                  className={inp}
                  placeholder="Enter full address"
                />

                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <LocationSection />

              <div>
                <label className={lbl}>Pin Code</label>
                <input
                  type="text"
                  {...register("pinCode")}
                  className={inp}
                  placeholder="Pin Code"
                />

                {errors.pinCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.pinCode.message}
                  </p>
                )}
              </div>
              <div>
                <label className={lbl}>Phone No.</label>
                <input
                  type="tel"
                  {...register("phone")}
                  className={inp}
                  placeholder="Enter Phone No."
                />

                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label className={lbl}>
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={inp}
                  placeholder="email@gmail.com"
                />

                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className={lbl}>Tax Rate (%)</label>
                <input
                  type="text"
                  {...register("taxRate")}
                  className={inp}
                  placeholder="e.g. 18"
                  min={0}
                  max={100}
                />

                {errors.taxRate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.taxRate.message}
                  </p>
                )}
              </div>
              <div>
                <label className={lbl}>Status</label>
                <div className="flex items-center gap-6 mt-2">
                  {["Active", "Inactive"].map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        {...register("status")}
                        value={s}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />

                      {errors.status && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.status.message}
                        </p>
                      )}
                      <span className="text-sm text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Contact Person Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
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
                className="w-4 h-4 accent-[#0F4C81]"
              />
              <span className="text-sm text-gray-600">Same As Above</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={lbl}>
                  Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("contactName")}
                  className={inp}
                  placeholder="Enter contact person name"
                />

                {errors.contactName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contactName.message}
                  </p>
                )}
              </div>
              <div>
                <label className={lbl}>
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register("contactMobile")}
                  className={inp}
                  placeholder="Enter mobile number"
                />

                {errors.contactMobile && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contactMobile.message}
                  </p>
                )}
              </div>
              <div>
                <label className={lbl}>
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("contactEmail")}
                  className={inp}
                  placeholder="Enter email address"
                />

                {errors.contactEmail && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Franchise Center Card */}
          {/* Franchise Center Card */}
          {showFranchiseSection && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {" "}
              {/* Header toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${isFranchise ? "bg-[#0F4C81]" : "bg-gray-200"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${isFranchise ? "left-5" : "left-0.5"}`}
                  />
                  <input
                    type="checkbox"
                    checked={makeFranchisee === 1}
                    onChange={(e) =>
                      setValue("makeFranchisee", e.target.checked ? 1 : 0, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="sr-only"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Make Branch as Franchise Center
                  </p>
                  <p className="text-xs text-gray-400">
                    Enable to configure franchise-specific fees and agreement
                  </p>
                </div>
              </label>
              {/* Expanded content */}
              {isFranchise && (
                <div className="mt-6 pt-5 border-t border-gray-100 space-y-5">
                  {/* Agreement upload */}
                  <div>
                    <label className={lbl}>Upload Scanned Agreement</label>
                    <input
                      type="file"
                      ref={franchiseFileRef}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (!file) return;

                        const allowedTypes = [
                          "application/pdf",
                          "image/jpeg",
                          "image/png",
                        ];

                        const maxSize = 10 * 1024 * 1024;

                        // Invalid type
                        if (!allowedTypes.includes(file.type)) {
                          setError("agreementFile", {
                            type: "manual",
                            message:
                              "Only PDF, JPG, and PNG files are allowed.",
                          });

                          // Clear the actual input
                          e.target.value = "";
                          setFranchiseFile(null);

                          return;
                        }

                        // Invalid size
                        if (file.size > maxSize) {
                          setError("agreementFile", {
                            type: "manual",
                            message: "File size must not exceed 10 MB.",
                          });

                          // Clear the actual input
                          e.target.value = "";
                          setFranchiseFile(null);

                          return;
                        }

                        // ✅ Only update UI after validation succeeds
                        clearErrors("agreementFile");

                        setFranchiseFile(file.name);

                        setValue("agreementFile", file, {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true,
                        });

                        setValue("agreementFileName", file?.name ?? "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });

                        setValue("agreementFileChanged", !!file, {
                          shouldDirty: true,
                        });
                      }}
                    />

                    <div
                      onClick={() => franchiseFileRef.current?.click()}
                      className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#0F4C81]/40 hover:bg-[#0F4C81]/3 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0F4C81]/15">
                        <Upload className="w-4 h-4 text-[#0F4C81]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">
                          {franchiseFile ? franchiseFile : "Choose File"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {franchiseFile
                            ? "Click to replace"
                            : "No file chosen · PDF, JPG, PNG · Max 10MB"}
                        </p>
                      </div>
                      {franchiseFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFranchiseFile(null);

                            setValue("agreementFile", null, {
                              shouldDirty: true,
                            });

                            setValue("agreementFileName", "", {
                              shouldDirty: true,
                            });

                            setValue("agreementFileChanged", true, {
                              shouldDirty: true,
                            });
                            if (franchiseFileRef.current)
                              franchiseFileRef.current.value = "";
                          }}
                          className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}{" "}
                    </div>
                    {errors.agreementFile && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.agreementFile.message}
                      </p>
                    )}
                  </div>

                  {/* SignUp Date + Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>
                        Sign Up Date <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input
                            type="date"
                            {...register("signUpDate")}
                            className={`${inp} pl-9`}
                          />

                          {errors.signUpDate && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.signUpDate.message}
                            </p>
                          )}
                        </div>
                        {/* <button
                        type="button"
                        onClick={() =>
                          setValue("signUpDate", "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className="text-xs text-[#0F4C81] font-medium px-2.5 py-2 border border-[#0F4C81]/30 rounded-lg hover:bg-[#0F4C81]/5 transition-colors whitespace-nowrap"
                      >
                        Clear Date
                      </button> */}
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Sign Up Amount</label>
                      <input
                        type="text"
                        {...register("signUpAmount")}
                        className={inp}
                        placeholder="Enter SignUp Amount"
                        min={0}
                      />

                      {errors.signUpAmount && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.signUpAmount.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Fee grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Center Monthly Fee</label>
                      <input
                        type="text"
                        {...register("monthlyFee")}
                        className={inp}
                        placeholder="Enter Monthly Fee"
                        min={0}
                      />

                      {errors.monthlyFee && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.monthlyFee.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={lbl}>Per Student Test / Exam Fee</label>
                      <input
                        type="text"
                        {...register("testFee")}
                        className={inp}
                        placeholder="Enter student test/exam fee"
                        min={0}
                      />

                      {errors.testFee && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.testFee.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={lbl}>
                        Per Student Certification Fee
                      </label>
                      <input
                        type="text"
                        {...register("certFee")}
                        className={inp}
                        placeholder="Enter student certification fee"
                        min={0}
                      />

                      {errors.certFee && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.certFee.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={lbl}>
                        Per Student Fee Commission across all subjects (%)
                      </label>
                      <input
                        type="text"
                        {...register("feeCommission")}
                        className={inp}
                        placeholder="Enter student fee commission"
                        min={0}
                        max={100}
                      />

                      {errors.feeCommission && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.feeCommission.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={lbl}>Per Student Fixed Fee</label>
                      <input
                        type="text"
                        {...register("fixedStudentFee")}
                        className={inp}
                        placeholder="Enter per student fixed fee"
                        min={0}
                      />

                      {errors.fixedStudentFee && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.fixedStudentFee.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Read-only status areas */}
                  {/* Course Configuration */}
                  <div className="space-y-5">
                    {/* Fixed Subject Fee */}
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">
                      Per Subject Fixed Fee
                    </h3>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3 max-h-[400px] overflow-y-auto">
                      <div className="max-h-[400px]">
                        {amountCourses.length > 0 ? (
                          renderCourseTable(amountCourses, setAmountCourses)
                        ) : (
                          <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                            No courses available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Per Subject Commission */}
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">
                      Per Student Fee Commission subject wise (%)
                    </h3>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3 max-h-[400px] overflow-y-auto">
                      <div className="max-h-[400px]">
                        {commissionCourses.length > 0 ? (
                          renderCourseTable(
                            commissionCourses,
                            setCommissionCourses,
                          )
                        ) : (
                          <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                            No courses available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Action Buttons */}
          <div className="pt-2">
            <ValidationErrorSummary />
            <div className="mt-4 flex items-center justify-start gap-3">
              {isEdit ? (
                <>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("..")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>

                  {/* <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button> */}
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Branch
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("..")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
