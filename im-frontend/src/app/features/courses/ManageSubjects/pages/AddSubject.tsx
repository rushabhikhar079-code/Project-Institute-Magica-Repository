import React, { useEffect, useState } from "react";
import {
  Building2,
  CreditCard,
  Calendar,
  Trash2,
  Save,
  X,
  Clock,
  Plus,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

import { useForm, useFieldArray, Controller } from "react-hook-form";

import {
  manageSubjectSchema,
  type ManageSubjectFormValues,
} from "../../validations/subjectSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../../redux/hooks";
import {
  createSubject,
  getSubjectById,
  setFixedInstallment,
  setMonthlyInstallment,
  setQuarterlyInstallment,
  updateSubject,
} from "../subjectService";
import { CustomDatePicker } from "../../../../components/common/CustomDatePicker";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";
import {
  getCourses,
  getCourseSubjects,
} from "../../ManageCourses/courseService";
import { CreateSubjectRequest } from "../types";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";
import { Dropdown } from "../../../../components/common/Select";

// Form Input & Label Styling Helpers
export const inp =
  "w-full h-[40px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] text-sm bg-white transition-all placeholder:text-gray-400";
export const lbl = "block text-sm font-medium text-gray-700 mb-1.5";
interface InstallmentRow {
  srNo: number;
  intervalDays: number;
  amount: string;
}
interface InstallmentTemplateRow {
  srNo: number;
  dayOfMonth: number;
  amount: number;
}
interface ManageSubjectsProps {
  mode: "add" | "edit";
}

export function ManageSubjects({ mode }: ManageSubjectsProps) {
  const isEdit = mode === "edit";

  const { id } = useParams<{ id: string }>();

  const subjectId = id ? Number(id) : undefined;
  const [curriculums, setCurriculums] = React.useState<any[]>([]);
  const [isCurriculumOpen, setIsCurriculumOpen] = React.useState(false);
  const [isCourseOpen, setIsCourseOpen] = React.useState(false);
  const navigate = useNavigate();
  const [courses, setCourses] = React.useState<any[]>([]);
  const [courseSubjectCount, setCourseSubjectCount] = useState(0);
  const [originalStatus, setOriginalStatus] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ManageSubjectFormValues>({
    resolver: zodResolver(manageSubjectSchema),
    defaultValues: {
      curriculumId: 0,
      courseId: 0,
      subName: "",
      description: "",
      duration: "",
      durationUnit: "Year",

      feesType: "Full Subject Fees",

      // Monthly sub-fee details
      subFeesType: "1",
      noofMonths: "",
      courseEndDate: "",

      subjectFee: "",
      adhocInstallment: false,
      isTaxable: false,
      taxType: "Including Tax",

      prorateAmount: false,
      installmentAllowed: true,
      maxInstallments: "1",

      createTemplate: false,
      templateStatus: "Active",
      intervalOption: "Fixed",
      fixedDays: "",
      monthlyDueDate: "",
      quarterlyDueDate: "",

      status: 1,
      hasCourseFees: false,

      installments: [
        {
          srNo: 1,
          intervalDays: 0,
          subjectFee: "0.00",
        },
      ],
    },
  });
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const syncTemplateRows = (templates: InstallmentTemplateRow[]) => {
    setTemplateRows(templates);

    setTemplateTotal(
      templates.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    );

    setValue(
      "installments",
      templates.map((row, index) => ({
        srNo: index + 1,
        intervalDays: Number(row.dayOfMonth) || 0,
        subjectFee: String(row.amount ?? 0),
      })),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );

    setIsIntervalSet(templates.length > 0);
  };
  const selectedCurriculumId = watch("curriculumId");
  const selectedCourseId = watch("courseId");
  const subFeesType = watch("subFeesType");
  const noofMonths = watch("noofMonths");
  const courseEndDate = watch("courseEndDate");

  console.log("SUB FEE TYPE:", subFeesType);
  console.log("COURSE END DATE:", courseEndDate);
  const selectedCourse = courses.find(
    (course) => Number(course.courseId) === Number(selectedCourseId),
  );

  const hasCourseFees = Number(selectedCourse?.courseFees ?? 0) > 0;
  const subjectName = watch("subName");
  const isCourseLevelFee = Number(selectedCourse?.isCourseLvl) === 1;

  useEffect(() => {
    if (!isEdit || !subjectId) return;

    const fetchSubject = async () => {
      try {
        const response = await getSubjectById(subjectId);

        console.log("GET SUBJECT BY ID RESPONSE:", response);

        const subject = response?.data;
        console.log("SUBJECT STATUS FROM API:", subject?.status);
        console.log("FULL SUBJECT:", subject);

        if (!subject) {
          toast.error("Subject details not found");
          return;
        }
        const parsedTemplateRows: InstallmentTemplateRow[] =
          subject.templateDetails?.map((item: string, index: number) => {
            const [day, amount] = item.split("#");

            return {
              srNo: index + 1,
              dayOfMonth: Number(day) || 0,
              amount: Number(amount) || 0,
            };
          }) ?? [];

        setTemplateRows(parsedTemplateRows);

        setTemplateTotal(
          parsedTemplateRows.reduce((sum, row) => sum + row.amount, 0),
        );

        setIsIntervalSet(parsedTemplateRows.length > 0);
        const subjectStatus = Number(subject.status ?? 1);

        setOriginalStatus(subjectStatus);
        reset({
          // ================================
          // SUBJECT DETAILS
          // ================================
          curriculumId: Number(subject.crclmId ?? 0),
          courseId: Number(subject.courseId ?? 0),

          subName: subject.subName ?? "",
          description: subject.description ?? "",

          duration:
            Number(subject.duration) > 0 ? String(subject.duration) : "",

          durationUnit:
            subject.durationType === 1
              ? "Year"
              : subject.durationType === 2
                ? "Month"
                : subject.durationType === 3
                  ? "Week"
                  : "Day",

          // ================================
          // FEES
          // ================================

          feesType:
            subject.feesType === "S" || subject.feesType === "Full Subject Fees"
              ? "Full Subject Fees"
              : subject.feesType === "M" || subject.feesType === "Monthly"
                ? "Monthly"
                : "Hourly",

          subjectFee: String(subject.fees ?? ""),

          adhocInstallment: Boolean(subject.adhocSub),

          isTaxable: Boolean(subject.taxable),

          taxType: subject.includingTax ? "Including Tax" : "Excluding Tax",
          subFeesType:
            Number(subject.subFeesType) >= 1 && Number(subject.subFeesType) <= 3
              ? (String(subject.subFeesType) as "1" | "2" | "3")
              : undefined,

          noofMonths:
            subject.subFeesType === 1 || subject.subFeesType === 2
              ? String(subject.noofMonths ?? "")
              : "",

          courseEndDate:
            subject.subFeesType === 3 ? (subject.courseEndDate ?? "") : "",
          // ================================
          // SUBJECT ATTRIBUTES
          // ================================

          prorateAmount: Boolean(subject.allowProrated),

          installmentAllowed: Boolean(subject.allowInstallment),

          maxInstallments: String(subject.maxInstallment ?? 1),

          // ================================
          // TEMPLATE
          // ================================

          createTemplate: Boolean(subject.isCreateTemplate),

          templateStatus: subject.templateStatus ? "Active" : "Inactive",

          intervalOption:
            subject.templateType === 1
              ? "Fixed"
              : subject.templateType === 2
                ? "Monthly"
                : "Quarterly",

          fixedDays:
            subject.templateType === 1 && subject.noofDays
              ? String(subject.noofDays)
              : "",

          monthlyDueDate:
            subject.templateType === 2 && subject.noofDays
              ? String(subject.noofDays)
              : "",

          quarterlyDueDate:
            subject.templateType === 3 && subject.noofDays
              ? String(subject.noofDays)
              : "",
          status: Number(subject.status ?? 1),
          installments:
            subject.templateDetails?.length > 0
              ? subject.templateDetails.map((item: string, index: number) => {
                  const [day, amount] = item.split("#");

                  return {
                    srNo: index + 1,
                    intervalDays: Number(day) || 0,
                    subjectFee: String(amount ?? "0"),
                  };
                })
              : [
                  {
                    srNo: 1,
                    intervalDays: 0,
                    subjectFee: "0.00",
                  },
                ],
        });

        if (parsedTemplateRows.length > 0) {
          setIsIntervalSet(true);
        }
      } catch (error) {
        console.error("Failed to fetch subject:", error);
        // toast.error("Failed to load subject");
      }
    };

    fetchSubject();
  }, [isEdit, subjectId, reset]);
  const feesType = watch("feesType");

  const amount = watch("subjectFee");
  const hasSubjectFee = Number(amount) > 0;
  const adhocInstallment = watch("adhocInstallment");
  const isTaxable = watch("isTaxable");
  const taxType = watch("taxType");
  const branchId = useAppSelector((state) => state.branch.branchId);
  const instituteId = useAppSelector((state) => state.auth.instituteId);

  const isInstituteLevel = Number(branchId) === 0;
  const prorateAmount = watch("prorateAmount");
  const installmentAllowed = watch("installmentAllowed");
  const maxInstallments = watch("maxInstallments");

  const createTemplate = watch("createTemplate");
  const templateStatus = watch("templateStatus");
  const intervalOption = watch("intervalOption");

  const fixedDays = watch("fixedDays");
  const monthlyDueDate = watch("monthlyDueDate");
  const quarterlyDueDate = watch("quarterlyDueDate");
  const isInstallmentDisabled = feesType === "Monthly" || feesType === "Hourly";
  const installments = watch("installments");
  const {
    fields: installmentFields,
    append,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: "installments",
  });

  const [templateRows, setTemplateRows] = useState<InstallmentTemplateRow[]>(
    [],
  );
  const handleTemplateAmountChange = (srNo: number, value: string) => {
    setTemplateRows((prev) => {
      const updatedRows = prev.map((row) =>
        row.srNo === srNo
          ? {
              ...row,
              amount: Number(value) || 0,
            }
          : row,
      );

      const total = updatedRows.reduce(
        (sum, row) => sum + (Number(row.amount) || 0),
        0,
      );

      setTemplateTotal(total);

      return updatedRows;
    });
  };
  const handleDeleteTemplate = () => {
    setValue("createTemplate", false);
    setValue("templateStatus", "Inactive");

    setValue("intervalOption", "Fixed");
    setValue("fixedDays", "");
    setValue("monthlyDueDate", "");
    setValue("quarterlyDueDate", "");

    // Clear installment values
    replace([]);

    // Clear errors
    clearErrors([
      "templateStatus",
      "intervalOption",
      "fixedDays",
      "monthlyDueDate",
      "quarterlyDueDate",
      "installments",
    ]);

    // Clear UI state
    setTemplateRows([]);
    setTemplateTotal(0);
    setIsIntervalSet(false);
  };
  const [templateTotal, setTemplateTotal] = useState(0);
  const [isIntervalSet, setIsIntervalSet] = useState(false);

  const onSubmit = async (data: ManageSubjectFormValues) => {
    console.log("VALID FORM DATA:", data);
    if (
      isEdit &&
      originalStatus !== null &&
      Number(data.status) !== originalStatus
    ) {
      const oldStatusText = originalStatus === 1 ? "active" : "inactive";

      const newStatusText = Number(data.status) === 1 ? "active" : "inactive";

      const confirmed = window.confirm(
        `This subject is ${oldStatusText}. Are you sure you want to make it ${newStatusText}?`,
      );

      if (!confirmed) {
        return;
      }
    }
    const createPayload: CreateSubjectRequest = {
      ...(isEdit && subjectId ? { subjectId } : {}),

      crclmId: Number(data.curriculumId),
      courseId: Number(data.courseId),

      subName: data.subName.trim(),
      description: data.description?.trim() || "",

      duration: data.duration ? Number(data.duration) : 0,

      durationType:
        data.durationUnit === "Year"
          ? 1
          : data.durationUnit === "Month"
            ? 2
            : data.durationUnit === "Week"
              ? 3
              : 4,

      // =====================================================
      // FEES DETAILS
      // =====================================================

      // Fees Details can be hidden when course-level fees
      // are being used, so never send undefined.
      feesType: hasCourseFees ? "" : (data.feesType ?? ""),

      subFeesType:
        hasCourseFees || data.feesType !== "Monthly"
          ? 0
          : Number(data.subFeesType || 0),

      noofMonths:
        !hasCourseFees &&
        data.feesType === "Monthly" &&
        (data.subFeesType === "1" || data.subFeesType === "2")
          ? Number(data.noofMonths || 0)
          : 0,

      courseEndDate:
        !hasCourseFees &&
        data.feesType === "Monthly" &&
        data.subFeesType === "3"
          ? data.courseEndDate || ""
          : "",
      updateAllBranches: false,

      fees: hasCourseFees ? 0 : Number(data.subjectFee || 0),

      adhocSub: !hasCourseFees && data.adhocInstallment ? 1 : 0,

      taxable: !hasCourseFees && data.isTaxable ? true : false,

      includingTax:
        !hasCourseFees &&
        data.isTaxable === true &&
        data.taxType === "Including Tax",

      // =====================================================
      // SUBJECT ATTRIBUTES
      // =====================================================

      allowProrated: data.prorateAmount,

      allowInstallment: data.installmentAllowed,

      maxInstallment: data.installmentAllowed
        ? Number(data.maxInstallments || 0)
        : 0,

      hasStudentsAssigned: false,

      // =====================================================
      // TEMPLATE
      // =====================================================

      paymentTemplateId: 0,

      isCreateTemplate: hasCourseFees
        ? false
        : data.feesType === "Hourly"
          ? false
          : data.feesType === "Monthly"
            ? false
            : data.createTemplate,

      templateStatus: hasCourseFees
        ? false
        : data.feesType === "Hourly" || data.feesType === "Monthly"
          ? false
          : data.createTemplate && data.templateStatus === "Active",

      templateType: hasCourseFees
        ? 0
        : data.feesType === "Hourly"
          ? 0
          : data.intervalOption === "Fixed"
            ? 1
            : data.intervalOption === "Monthly"
              ? 2
              : data.intervalOption === "Quarterly"
                ? 3
                : 0,

      noofDays: hasCourseFees
        ? 0
        : data.feesType === "Hourly"
          ? 0
          : data.intervalOption === "Fixed"
            ? Number(data.fixedDays) || 0
            : data.intervalOption === "Monthly"
              ? Number(data.monthlyDueDate) || 0
              : data.intervalOption === "Quarterly"
                ? Number(data.quarterlyDueDate) || 0
                : 0,

      templateDetails: hasCourseFees
        ? []
        : data.feesType === "Hourly"
          ? []
          : data.feesType === "Monthly"
            ? []
            : data.createTemplate
              ? templateRows.map(
                  (row) =>
                    `${Number(row.dayOfMonth) || 0}#${Number(row.amount) || 0}`,
                )
              : [],

      // =====================================================
      // STATUS / BRANCH
      // =====================================================

      status: isEdit ? Number(data.status) : 1,

      branchId: Number(branchId),

      isSubjectLvl: true,

      type: "",

      hsncode: "",

      trainerIds: [],
    };

    console.log("SUBJECT PAYLOAD:", createPayload);

    try {
      if (isEdit) {
        const response = await updateSubject(subjectId!, createPayload);

        console.log("UPDATE SUBJECT RESPONSE:", response);

        toast.success("Subject updated successfully");

        navigate("/managesubjects", {
          state: {
            updatedSubjectId: subjectId,
          },
        });

        return;
      } else {
        // ADD
        const response = await createSubject(createPayload);

        console.log("CREATE SUBJECT RESPONSE:", response);

        toast.success("Subject created successfully");

        // Go back to subject list and load page 1
        navigate("/managesubjects", {
          state: {
            resetPage: true,
          },
        });
      }
    } catch (error) {
      console.error("Failed to save subject:", error);

      // toast.error(
      //   isEdit ? "Failed to update subject" : "Failed to create subject",
      // );
    }
  };
  const handleFixedSet = async () => {
    const subjectFee = Number(watch("subjectFee"));
    const maxInstallment = Number(watch("maxInstallments"));
    const day = Number(watch("fixedDays"));

    if (subjectFee <= 0) {
      toast.error("Subject Fee must be greater than 0");
      return;
    }

    if (maxInstallment <= 0) {
      toast.error("Maximum Installment must be greater than 0");
      return;
    }

    if (day <= 0) {
      toast.error("Fixed days must be greater than 0");
      return;
    }

    try {
      const response = await setFixedInstallment({
        courseFee: subjectFee,
        maxInstallment,
        day,
        branchId,
      });

      console.log("FIXED INSTALLMENT RESPONSE:", response);

      const templateData = response?.data;
      const templates = templateData?.templates ?? [];

      syncTemplateRows(templates);
    } catch (error) {
      console.error("Failed to set fixed installment:", error);
      // toast.error("Failed to set fixed installment");
    }
  };

  const handleMonthlySet = async () => {
    const subjectFee = Number(watch("subjectFee"));
    const maxInstallment = Number(watch("maxInstallments"));
    const day = Number(watch("monthlyDueDate"));

    if (subjectFee <= 0) {
      toast.error("Subject Fee must be greater than 0");
      return;
    }

    if (maxInstallment <= 0) {
      toast.error("Maximum Installment must be greater than 0");
      return;
    }

    if (day <= 0) {
      toast.error("Monthly due date must be greater than 0");
      return;
    }

    try {
      const response = await setMonthlyInstallment({
        courseFee: subjectFee,
        maxInstallment,
        day,
        branchId,
      });

      console.log("MONTHLY INSTALLMENT RESPONSE:", response);

      const templateData = response?.data;

      const templates = templateData?.templates ?? [];

      syncTemplateRows(templates);
    } catch (error) {
      console.error("Failed to set monthly installment:", error);
      // toast.error("Failed to set monthly installment");
    }
  };
  const handleQuarterlySet = async () => {
    const subjectFee = Number(watch("subjectFee"));
    const maxInstallment = Number(watch("maxInstallments"));
    const day = Number(watch("quarterlyDueDate"));

    if (subjectFee <= 0) {
      toast.error("Subject Fee must be greater than 0");
      return;
    }

    if (maxInstallment <= 0) {
      toast.error("Maximum Installment must be greater than 0");
      return;
    }

    if (day <= 0) {
      toast.error("Quarterly due date must be greater than 0");
      return;
    }

    try {
      const response = await setQuarterlyInstallment({
        courseFee: subjectFee,
        maxInstallment,
        day,
        branchId,
      });

      console.log("QUARTERLY INSTALLMENT RESPONSE:", response);

      const templateData = response?.data;

      const templates = templateData?.templates ?? [];

      syncTemplateRows(templates);
    } catch (error) {
      console.error("Failed to set quarterly installment:", error);
      // toast.error("Failed to set quarterly installment");
    }
  };
  const handleCancel = () => {
    reset();
  };

  useEffect(() => {
    setValue("hasCourseFees", hasCourseFees, {
      shouldValidate: true,
    });
  }, [hasCourseFees, setValue]);
  useEffect(() => {
    setValue("hasCourseFees", hasCourseFees, {
      shouldValidate: true,
    });

    if (hasCourseFees) {
      setValue("prorateAmount", false);
    }
  }, [hasCourseFees, setValue]);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 100,
          branchId: Number(branchId),
        });

        console.log("CURRICULUM DROPDOWN:", response);

        setCurriculums(response.items ?? []);
      } catch (error) {
        console.error("Failed to fetch curriculums:", error);
        setCurriculums([]);
      }
    };

    fetchCurriculums();
  }, [branchId]);
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseSubjectCount(0);
      return;
    }

    const fetchSubjectCount = async () => {
      try {
        const response = await getCourseSubjects({
          branchId: Number(branchId),
          courseIds: [Number(selectedCourseId)],
          pageNumber: 1,
          pageSize: 10,
        });

        console.log("COURSE ID SENT TO SUBJECT API:", Number(selectedCourseId));
        console.log("SUBJECT API RESPONSE:", response);

        setCourseSubjectCount(response?.totalCount ?? 0);
      } catch (error) {
        console.error("Failed to fetch course subjects:", error);
        setCourseSubjectCount(0);
      }
    };

    fetchSubjectCount();
  }, [selectedCourseId, branchId]);
  useEffect(() => {
    const fetchCourses = async () => {
      // Don't fetch until we have the required ID
      if (Number(instituteId) <= 0) return;

      try {
        const response = await getCourses({
          courseName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,

          // Always send the actual institute
          instituteId: Number(instituteId),

          // 0 at institute level, actual branchId at branch level
          branchId: Number(branchId),
        });

        console.log("COURSES:", {
          level: isInstituteLevel ? "INSTITUTE" : "BRANCH",
          instituteId,
          branchId,
          response,
        });

        setCourses(response.items ?? []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]);
      }
    };

    fetchCourses();
  }, [instituteId, branchId, isInstituteLevel]);

  const filteredCourses =
    Number(selectedCurriculumId) > 0
      ? courses.filter(
          (course) => Number(course.crclmId) === Number(selectedCurriculumId),
        )
      : courses;
  useEffect(() => {
    if (!installmentAllowed) {
      setValue("maxInstallments", "0");
    }
  }, [installmentAllowed, setValue]);
  React.useEffect(() => {
    if (feesType !== "Full Subject Fees" && adhocInstallment) {
      setValue("adhocInstallment", false);
    }
  }, [feesType, adhocInstallment, setValue]);
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Header Matching Title Style */}
      <PageHeader
        description={isEdit ? "Update subject details" : "Create a new subject"}
        extraBreadcrumbs={[
          {
            label: isEdit
              ? `Edit Subject - ${subjectName || "Subject"}`
              : "Add Subject",
          },
        ]}
      />
      <form
        className="space-y-6"
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("FORM VALIDATION ERRORS:", errors);
        })}
      >
        {/* SECTION 1: Subject Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
            <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-[#0F4C81]">
              Subject Details
            </h2>
          </div>

          <div className="space-y-4">
            {/* Row 1: Curriculum & Course/Class Name with New Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ================= CURRICULUM ================= */}
              <Controller
                name="curriculumId"
                control={control}
                render={({ field: { value, onChange } }) => {
                  const selectedCurriculum = curriculums.find(
                    (curriculum) =>
                      Number(curriculum.CurriculumId) === Number(value),
                  );

                  return (
                    <div className="relative">
                      <label className={lbl}>Curriculum Name</label>

                      {/* Selected value */}
                      {/* Selected value */}
                      <div
                        className={`${inp} flex items-center justify-between ${
                          isEdit
                            ? "bg-gray-100 cursor-not-allowed text-gray-500"
                            : "cursor-pointer"
                        } ${
                          errors.curriculumId
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : ""
                        }`}
                        onClick={() => {
                          if (!isEdit) {
                            setIsCurriculumOpen((prev) => !prev);
                          }
                        }}
                      >
                        <span
                          className={
                            Number(value) === 0
                              ? "text-gray-400"
                              : "text-gray-700"
                          }
                        >
                          {selectedCurriculum?.CurriculumName ||
                            "Select Curriculum"}
                        </span>

                        <ChevronDown
                          size={16}
                          className={`text-gray-500 transition-transform ${
                            isCurriculumOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {/* Dropdown */}
                      {!isEdit && isCurriculumOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1">
                          {/* Default */}
                          <div
                            onClick={() => {
                              onChange(0);
                              setValue("courseId", 0);
                              setIsCurriculumOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                              Number(value) === 0
                                ? "bg-[#0F4C81] text-white font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Select Curriculum
                          </div>

                          {/* Curriculums */}
                          {[...curriculums]
                            .sort((a, b) => {
                              const nameA = a.CurriculumName.trim();
                              const nameB = b.CurriculumName.trim();

                              const startsWithNumberA = /^\d/.test(nameA);
                              const startsWithNumberB = /^\d/.test(nameB);

                              // Numbers first
                              if (startsWithNumberA && !startsWithNumberB)
                                return -1;
                              if (!startsWithNumberA && startsWithNumberB)
                                return 1;

                              // Both start with numbers → compare ONLY first digit
                              if (startsWithNumberA && startsWithNumberB) {
                                const firstDigitA = Number(nameA.charAt(0));
                                const firstDigitB = Number(nameB.charAt(0));

                                if (firstDigitA !== firstDigitB) {
                                  return firstDigitA - firstDigitB;
                                }

                                // Same first digit → alphabetical
                                return nameA.localeCompare(nameB, undefined, {
                                  sensitivity: "base",
                                });
                              }

                              // Both alphabetic → A-Z
                              return nameA.localeCompare(nameB, undefined, {
                                sensitivity: "base",
                              });
                            })
                            .map((curriculum) => {
                              const isSelected =
                                Number(curriculum.CurriculumId) ===
                                Number(value);

                              return (
                                <div
                                  key={curriculum.CurriculumId}
                                  onClick={() => {
                                    onChange(Number(curriculum.CurriculumId));

                                    // Reset course when curriculum changes
                                    setValue("courseId", 0);

                                    setIsCurriculumOpen(false);
                                  }}
                                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                    isSelected
                                      ? "bg-[#0F4C81] text-white font-medium"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {curriculum.CurriculumName}
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {errors.curriculumId && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.curriculumId.message}
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              {/* ================= COURSE ================= */}
              <Controller
                name="courseId"
                control={control}
                render={({ field: { value, onChange } }) => {
                  const selectedCourse = courses.find(
                    (course) => Number(course.courseId) === Number(value),
                  );

                  const hasCourseFees =
                    Number(selectedCourse?.courseFees ?? 0) > 0;

                  return (
                    <div className="relative">
                      <label className={lbl}>
                        Course/Class Name{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      {/* Selected value */}
                      <div
                        className={`${inp} flex items-center justify-between ${
                          isEdit
                            ? "bg-gray-100 cursor-not-allowed text-gray-500"
                            : "cursor-pointer"
                        } ${
                          errors.courseId
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : ""
                        }`}
                        onClick={() => {
                          if (!isEdit) {
                            setIsCourseOpen((prev) => !prev);
                          }
                        }}
                      >
                        <span
                          className={
                            Number(value) === 0
                              ? "text-gray-400"
                              : "text-gray-700"
                          }
                        >
                          {selectedCourse?.course_Name ||
                            "Select Course/Class Name"}
                        </span>

                        <ChevronDown
                          size={16}
                          className={`text-gray-500 transition-transform ${
                            isCourseOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {/* Dropdown */}
                      {!isEdit && isCourseOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1">
                          {/* Default */}
                          <div
                            onClick={() => {
                              onChange(0);
                              setIsCourseOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                              Number(value) === 0
                                ? "bg-[#0F4C81] text-white font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Select Course/Class Name
                          </div>

                          {/* Courses */}
                          {[...filteredCourses]
                            .sort((a, b) => {
                              const nameA = a.course_Name.trim();
                              const nameB = b.course_Name.trim();

                              const startsWithNumberA = /^\d/.test(nameA);
                              const startsWithNumberB = /^\d/.test(nameB);

                              // Numbers first
                              if (startsWithNumberA && !startsWithNumberB)
                                return -1;
                              if (!startsWithNumberA && startsWithNumberB)
                                return 1;

                              // Both start with numbers → compare ONLY first digit
                              if (startsWithNumberA && startsWithNumberB) {
                                const firstDigitA = Number(nameA.charAt(0));
                                const firstDigitB = Number(nameB.charAt(0));

                                if (firstDigitA !== firstDigitB) {
                                  return firstDigitA - firstDigitB;
                                }

                                // Same first digit → alphabetical
                                return nameA.localeCompare(nameB, undefined, {
                                  sensitivity: "base",
                                });
                              }

                              // Both alphabetic → A-Z
                              return nameA.localeCompare(nameB, undefined, {
                                sensitivity: "base",
                              });
                            })
                            .map((course) => {
                              const isSelected =
                                Number(course.courseId) === Number(value);

                              return (
                                <div
                                  key={course.courseId}
                                  onClick={() => {
                                    onChange(Number(course.courseId));
                                    setIsCourseOpen(false);
                                  }}
                                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                    isSelected
                                      ? "bg-[#0F4C81] text-white font-medium"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {course.course_Name}
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {/* Course-level fee message */}
                      {hasCourseFees && (
                        <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                          <p className="text-sm font-medium text-[#0F4C81]">
                            The class level fees is defined:
                            {Number(selectedCourse.courseFees).toFixed(2)}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            Subjects in this course: {courseSubjectCount}
                          </p>
                        </div>
                      )}

                      {errors.courseId && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.courseId.message}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
            </div>
            {/* Row 2: Subject Name & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`${inp} ${
                    errors.subName
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : ""
                  }`}
                  {...register("subName")}
                  placeholder="Enter Subject Name"
                />

                {errors.subName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.subName.message}
                  </p>
                )}
              </div>

              <div>
                <label className={lbl}>Description</label>
                <textarea
                  rows={2}
                  {...register("description")}
                  className={`${inp} min-h-[100px] resize-y ${
                    errors.description
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : ""
                  }`}
                  placeholder="Enter description..."
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Duration</label>

                <div className="flex gap-2">
                  <div className="w-1/2">
                    <input
                      type="text"
                      {...register("duration")}
                      className={`${inp} w-full ${
                        errors.duration
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="Duration"
                    />

                    {errors.duration && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>

                  <div className="w-1/2">
                    <Controller
                      name="durationUnit"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { label: "Year", value: "Year" },
                            { label: "Month", value: "Month" },
                            { label: "Week", value: "Week" },
                            { label: "Day", value: "Day" },
                          ]}
                        />
                      )}
                    />

                    {errors.durationUnit && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.durationUnit.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* SECTION 2: Fees Details */}
        {/* SECTION 2: Fees Details */}
        {!hasCourseFees && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 stroke-[2]" />
              </div>

              <h2 className="text-lg font-bold text-[#0F4C81]">Fees Details</h2>
            </div>

            <div className="space-y-6">
              {/* ================= FEES TYPE ================= */}
              <div>
                <label className={lbl}>Fees Type</label>

                <div className="flex gap-6 mt-2 flex-wrap">
                  {["Full Subject Fees", "Monthly", "Hourly"].map((type) => {
                    const isDisabled =
                      adhocInstallment &&
                      (type === "Monthly" || type === "Hourly");

                    return (
                      <label
                        key={type}
                        className={`flex items-center gap-2 text-sm ${
                          isDisabled
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="feesType"
                          value={type}
                          checked={feesType === type}
                          disabled={isDisabled}
                          onChange={() => {
                            setValue(
                              "feesType",
                              type as ManageSubjectFormValues["feesType"],
                            );

                            if (type !== "Monthly") {
                              setValue("subFeesType", undefined);
                              setValue("noofMonths", "");
                              setValue("courseEndDate", "");

                              clearErrors([
                                "subFeesType",
                                "noofMonths",
                                "courseEndDate",
                              ]);
                            }
                          }}
                          className="w-4 h-4 accent-[#0F4C81]"
                        />

                        {type}
                      </label>
                    );
                  })}
                </div>
              </div>
              {/* ================= fees details section ================= */}
              <div>
                {feesType === "Monthly" && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                    {/* Fixed Duration */}
                    <div className="flex items-start gap-4">
                      <label className="flex items-center gap-2 cursor-pointer w-[260px] shrink-0 pt-2">
                        <input
                          type="radio"
                          value="1"
                          checked={subFeesType === "1"}
                          onChange={() => {
                            setValue("subFeesType", "1", {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                            setValue("noofMonths", "");
                            setValue("courseEndDate", "");
                          }}
                          className="w-4 h-4 accent-[#0F4C81]"
                        />

                        <span className="text-sm text-gray-700">
                          Fixed Duration
                        </span>
                      </label>

                      <div className="w-[185px]">
                        <input
                          type="text"
                          className={`${inp} w-full`}
                          placeholder="No. of months"
                          disabled={subFeesType !== "1"}
                          value={subFeesType === "1" ? noofMonths : ""}
                          onChange={(e) =>
                            setValue("noofMonths", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            })
                          }
                        />

                        {subFeesType === "1" && errors.noofMonths && (
                          <p className="mt-1 text-xs text-red-500 whitespace-nowrap">
                            {errors.noofMonths.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ongoing */}
                    <div className="flex items-start gap-4">
                      <label className="flex items-center gap-2 cursor-pointer w-[260px] shrink-0 pt-2">
                        <input
                          type="radio"
                          value="2"
                          checked={subFeesType === "2"}
                          onChange={() => {
                            setValue("subFeesType", "2", {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                            setValue("noofMonths", "");
                            setValue("courseEndDate", "");
                          }}
                          className="w-4 h-4 accent-[#0F4C81]"
                        />

                        <span className="text-sm text-gray-700">
                          Ongoing (Monthly Tutions, Hobby Workshops)
                        </span>
                      </label>

                      <div className="w-[185px]">
                        <input
                          type="text"
                          className={`${inp} w-full`}
                          placeholder="No. of months"
                          disabled={subFeesType !== "2"}
                          value={subFeesType === "2" ? noofMonths : ""}
                          onChange={(e) =>
                            setValue("noofMonths", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            })
                          }
                        />

                        {subFeesType === "2" && errors.noofMonths && (
                          <p className="mt-1 text-xs text-red-500 whitespace-nowrap">
                            {errors.noofMonths.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Course End Date */}
                    <div className="flex items-start gap-4">
                      <label className="flex items-center gap-2 cursor-pointer w-[260px] shrink-0 pt-2">
                        <input
                          type="radio"
                          value="3"
                          checked={subFeesType === "3"}
                          onChange={() => {
                            setValue("subFeesType", "3", {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                            setValue("noofMonths", "");
                            setValue("courseEndDate", "");
                          }}
                          className="w-4 h-4 accent-[#0F4C81]"
                        />

                        <span className="text-sm text-gray-700">
                          Course End Date
                        </span>
                      </label>

                      <div className="w-[185px]">
                        <Controller
                          name="courseEndDate"
                          control={control}
                          render={({ field }) => (
                            <CustomDatePicker
                              name={field.name}
                              value={field.value ?? ""}
                              disabled={subFeesType !== "3"}
                              className="w-full"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />

                        {subFeesType === "3" && errors.courseEndDate && (
                          <p className="mt-1 text-xs text-red-500 whitespace-nowrap">
                            {errors.courseEndDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* ================= AMOUNT ================= */}
              <div>
                <label className={lbl}>
                  Amount <span className="text-red-500">*</span>
                </label>

                <div className="relative max-w-md">
                  <input
                    type="text"
                    className={`${inp} ${
                      errors.subjectFee
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : ""
                    }`}
                    {...register("subjectFee")}
                    placeholder="0.00"
                  />
                </div>

                {errors.subjectFee && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.subjectFee.message}
                  </p>
                )}
              </div>

              {/* ================= ADHOC INSTALLMENT ================= */}
              {feesType === "Full Subject Fees" && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("adhocInstallment")}
                      className="w-4 h-4 accent-[#0F4C81] rounded"
                    />

                    <span className="text-sm font-medium text-gray-700">
                      Adhoc Subject Installment
                    </span>
                  </label>
                </div>
              )}

              {/* ================= TAXABLE + TAX CALCULATION ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Taxable */}
                <div>
                  <label className={lbl}>Taxable</label>

                  <div className="flex gap-6 mt-2">
                    {[
                      { label: "Yes", val: true },
                      { label: "No", val: false },
                    ].map(({ label, val }) => (
                      <label
                        key={label}
                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                      >
                        <Controller
                          name="isTaxable"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="radio"
                              checked={field.value === val}
                              onChange={() => field.onChange(val)}
                              className="w-4 h-4 accent-[#0F4C81]"
                            />
                          )}
                        />

                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tax Calculation */}
                <div>
                  <label
                    className={`${lbl} ${!isTaxable ? "text-gray-400" : ""}`}
                  >
                    Tax Calculation
                  </label>

                  <div className="flex gap-6 mt-2">
                    {["Including Tax", "Excluding Tax"].map((t) => (
                      <label
                        key={t}
                        className={`flex items-center gap-2 text-sm ${
                          isTaxable
                            ? "cursor-pointer text-gray-700"
                            : "cursor-not-allowed text-gray-400"
                        }`}
                      >
                        <Controller
                          name="taxType"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="radio"
                              checked={field.value === t}
                              onChange={() => field.onChange(t)}
                              disabled={!isTaxable}
                              className="w-4 h-4 accent-[#0F4C81] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          )}
                        />

                        {t}
                      </label>
                    ))}
                  </div>

                  {isTaxable && errors.taxType && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.taxType.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Subject Attributes */}
        {!adhocInstallment &&
          !hasCourseFees &&
          feesType !== "Monthly" &&
          feesType !== "Hourly" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
                </div>

                <h2 className="text-lg font-bold text-[#0F4C81]">
                  Subject Attributes
                </h2>
              </div>

              <div className="space-y-4">
                {/* Prorate Amount & Installment Allowed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prorate Amount */}
                  <div>
                    <label className={lbl}>Prorate Amount</label>

                    <div className="flex gap-6 mt-1">
                      {[
                        { label: "Yes", val: true },
                        { label: "No", val: false },
                      ].map(({ label, val }) => (
                        <label
                          key={label}
                          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                        >
                          <Controller
                            name="prorateAmount"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="radio"
                                checked={field.value === val}
                                onChange={() => field.onChange(val)}
                                className="w-4 h-4 accent-[#0F4C81]"
                              />
                            )}
                          />

                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Installment Allowed */}
                  <div>
                    <label className={lbl}>Installment Allowed</label>

                    <div className="flex gap-6 mt-1">
                      {[
                        { label: "Yes", val: true },
                        { label: "No", val: false },
                      ].map(({ label, val }) => (
                        <label
                          key={label}
                          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                        >
                          <Controller
                            name="installmentAllowed"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="radio"
                                checked={field.value === val}
                                onChange={() => field.onChange(val)}
                                className="w-4 h-4 accent-[#0F4C81]"
                              />
                            )}
                          />

                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Maximum Installment Input */}
                <div className="max-w-xs">
                  <label className={lbl}>
                    Maximum Installment{" "}
                    {installmentAllowed && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <input
                    type="text"
                    min={1}
                    disabled={!installmentAllowed}
                    className={`${inp} ${
                      !installmentAllowed
                        ? "bg-gray-100 cursor-not-allowed opacity-60"
                        : ""
                    } ${
                      errors.maxInstallments
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : ""
                    }`}
                    {...register("maxInstallments")}
                  />
                </div>

                {/* Create Template Checkbox Control */}
                {!isInstallmentDisabled && !hasCourseFees && hasSubjectFee && (
                  <div className="pt-3 border-t border-gray-100 flex items-center">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("createTemplate")}
                          className="w-4 h-4 accent-[#0F4C81] rounded"
                        />

                        <span className="text-sm font-semibold text-gray-800">
                          Create Installment Template
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={handleDeleteTemplate}
                        disabled={!createTemplate || templateRows.length === 0}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          createTemplate && templateRows.length > 0
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Template
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        {/* NESTED TEMPLATE PANEL (Triggered by "Create Template") */}
        {!adhocInstallment &&
          !isInstallmentDisabled &&
          hasSubjectFee &&
          !hasCourseFees &&
          createTemplate && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 stroke-[2]" />
                </div>
                <h2 className="text-lg font-bold text-[#0F4C81]">
                  Installment Template Details
                </h2>
              </div>

              <div className="space-y-5">
                {/* Template Status */}
                <div>
                  <label className={lbl}>Template Status</label>
                  <div className="flex gap-6 mt-1">
                    {["Active", "Inactive"].map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                      >
                        <Controller
                          name="templateStatus"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="radio"
                              value={s}
                              checked={field.value === s}
                              onChange={() => field.onChange(s)}
                              className="w-4 h-4 accent-[#0F4C81]"
                            />
                          )}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Set Installment Interval Bordered Container */}
                <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <label className={`${lbl} flex items-center gap-1.5`}>
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    Set Installment Interval
                  </label>

                  {/* Option 1: Fixed */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer min-w-[220px]">
                      <input
                        type="radio"
                        value="Fixed"
                        {...register("intervalOption", {
                          onChange: () => {
                            setValue("monthlyDueDate", "");
                            setValue("quarterlyDueDate", "");

                            // Clear generated template rows
                            setTemplateRows([]);
                            setTemplateTotal(0);
                            setIsIntervalSet(false);
                          },
                        })}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />
                      <span className="text-sm text-gray-700">
                        Fixed days interval
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`${inp} w-28 ${
                          intervalOption !== "Fixed"
                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                            : ""
                        } ${
                          errors.fixedDays
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : ""
                        }`}
                        {...register("fixedDays")}
                        placeholder="Days"
                        disabled={intervalOption !== "Fixed"}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={intervalOption !== "Fixed"}
                      onClick={handleFixedSet}
                      className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#0c3d6a] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                      Set
                    </button>
                  </div>

                  {/* Option 2: Monthly */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer min-w-[220px]">
                      <input
                        type="radio"
                        value="Monthly"
                        {...register("intervalOption", {
                          onChange: () => {
                            setValue("fixedDays", "");
                            setValue("quarterlyDueDate", "");

                            // Clear generated template rows
                            setTemplateRows([]);
                            setTemplateTotal(0);
                            setIsIntervalSet(false);
                          },
                        })}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />
                      <span className="text-sm text-gray-700">
                        Monthly interval - due date
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`${inp} w-28 ${
                          intervalOption !== "Monthly"
                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                            : ""
                        } ${
                          errors.monthlyDueDate
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : ""
                        }`}
                        {...register("monthlyDueDate")}
                        placeholder="Due Date"
                        disabled={intervalOption !== "Monthly"}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={intervalOption !== "Monthly"}
                      onClick={handleMonthlySet}
                      className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#0c3d6a] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                      Set
                    </button>
                  </div>

                  {/* Option 3: Quarterly */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer min-w-[220px]">
                      <input
                        type="radio"
                        value="Quarterly"
                        {...register("intervalOption", {
                          onChange: () => {
                            setValue("fixedDays", "");
                            setValue("monthlyDueDate", "");

                            // Clear generated template rows
                            setTemplateRows([]);
                            setTemplateTotal(0);
                            setIsIntervalSet(false);
                          },
                        })}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />
                      <span className="text-sm text-gray-700">
                        Quarterly interval - due date
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`${inp} w-28 ${
                          intervalOption !== "Quarterly"
                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                            : ""
                        } ${
                          errors.quarterlyDueDate
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : ""
                        }`}
                        {...register("quarterlyDueDate")}
                        placeholder="Due Date"
                        disabled={intervalOption !== "Quarterly"}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={intervalOption !== "Quarterly"}
                      onClick={handleQuarterlySet}
                      className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#0c3d6a] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                      Set
                    </button>
                  </div>
                </div>

                {/* Installment Table */}
                {isIntervalSet && (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#0f4c81] border-b border-gray-200 text-xs font-semibold text-white uppercase tracking-wider">
                          <th className="px-4 py-3 w-20">Sr.No</th>
                          <th className="px-4 py-3">Interval in days</th>
                          <th className="px-4 py-3">Amount </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {templateRows.map((row, index) => (
                          <tr
                            key={row.srNo}
                            className={`transition-colors ${
                              index % 2 === 1
                                ? "bg-[#e0eef5]/30 hover:bg-[#e0eef5]/60"
                                : "bg-white hover:bg-[#e0eef5]/60"
                            }`}
                          >
                            <td className="px-4 py-3 font-mono text-gray-600">
                              {row.srNo}
                            </td>

                            <td className="px-4 py-3 text-gray-700">
                              {row.dayOfMonth}
                            </td>

                            <td className="px-4 py-3">
                              <div className="relative max-w-[160px]">
                                <input
                                  type="text"
                                  value={row.amount}
                                  onChange={(e) =>
                                    handleTemplateAmountChange(
                                      row.srNo,
                                      e.target.value,
                                    )
                                  }
                                  className={`${inp}`}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot>
                        <tr className="bg-slate-50 font-semibold text-slate-800 border-t border-slate-200 text-xs">
                          {/* Sr.No column */}
                          <td></td>

                          {/* Interval in days column */}
                          <td>
                            <div className="flex justify-end">
                              <span>Total Amount :</span>
                            </div>
                          </td>

                          {/* Amount column */}
                          <td className="px-6 py-2">
                            <span>{templateTotal.toFixed(2)}</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        {isEdit && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className={lbl}>Status</label>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="flex gap-6 mt-1">
                  {[
                    { label: "Active", value: 1 },
                    { label: "Inactive", value: 0 },
                  ].map(({ label, value }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        checked={Number(field.value) === value}
                        onChange={() => field.onChange(value)}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />

                      {label}
                    </label>
                  ))}
                </div>
              )}
            />

            {errors.status && (
              <p className="mt-1 text-xs text-red-500">
                {errors.status.message}
              </p>
            )}
          </div>
        )}
        {/* Form Actions */}
        <div>
          <ValidationErrorSummary />

          <div className="mt-4 flex items-center justify-start gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-[#0F4C81] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0c3d6a]"
            >
              <Save className="h-4 w-4" />
              {isEdit ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={() => navigate("..")}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ManageSubjects;
