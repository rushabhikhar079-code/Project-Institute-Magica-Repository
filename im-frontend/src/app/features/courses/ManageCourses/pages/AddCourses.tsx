import React, { useEffect, useRef, useState } from "react";
import {
  Building2,
  CreditCard,
  Calendar,
  Trash2,
  Save,
  X,
  Users,
  Clock,
  BookOpen,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  useForm,
  useFieldArray,
  Controller,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  CourseFormValidation,
  courseSchema,
} from "../../validations/courseSchema";
import {
  createCourse,
  updateCourse,
  getAllStaff,
  getCounsellors,
  Staff,
  setFixedInstallment,
  setMonthlyInstallment,
  setQuarterlyInstallment,
  getCourseById,
} from "../courseService";

import type { CreateCourseRequest } from "../types";
import { CurriculumList } from "../../ManageCurriculum/types";
import { toast } from "react-toastify";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";
import { useAppSelector } from "../../../../redux/hooks";
import { CurriculumSearchRequest } from "../../ManageCurriculum/curriculumService";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import { CourseOutletContext } from "./ManageCourses";
import { Dropdown } from "../../../../components/common/Select";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";

// Form Input & Label Styling Helpers
export const inp =
  "w-full h-[40px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] text-sm bg-white transition-all placeholder:text-gray-400";

export const lbl = "block text-sm font-medium text-gray-700 mb-1.5";
export const ddl = "px-3 py-2 text-sm cursor-pointer transition-colors";

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

interface InstallmentTemplateResponse {
  templates: InstallmentTemplateRow[];
  totalAmount: number;
}
interface DisplayStaff {
  id: number;
  name: string;
}
type AddCoursesProps = {
  mode: "add" | "edit";
};
const DEFAULT_FORM_VALUES: CourseFormValidation = {
  courseClassName: "",
  curriculumId: 0,
  description: "",
  courseType: "",
  hsncode: "",
  type: "",
  duration: "",
  durationUnit: "Year",

  showAllStaff: false,
  selectedStaffIds: [],
  courseLevelFees: false,

  feeType: "Full Course Fee",
  adhocInstallment: false,

  courseFee: "0",

  isTaxable: false,
  includingTax: true,

  installmentAllowed: true,
  maxInstallments: "1",

  createTemplate: false,

  templateStatus: "Active",

  intervalOption: "Fixed",

  fixedDays: "",
  monthlyDueDate: "",
  quarterlyDueDate: "",

  installments: [
    {
      intervalDays: 0,
      amount: "0.00",
    },
  ],
  status: "Active", // ADD
};

export default function AddCourses({ mode }: AddCoursesProps) {
  const isEdit = mode === "edit";

  const { id } = useParams<{ id: string }>();
  const paymentTemplateIdRef = useRef(0);
  const originalStatusRef = useRef<"Active" | "Inactive">("Active");
  const navigate = useNavigate();
  const { resetCoursesPagination, updateCourseRow } =
    useOutletContext<CourseOutletContext>();
  const [showZeroFeeModal, setShowZeroFeeModal] = useState(false);
  const [pendingFormData, setPendingFormData] =
    useState<CourseFormValidation | null>(null);
  const courseId = id ? Number(id) : undefined;
  const branchId = useAppSelector((state) => state.branch.branchId);
  const instituteId = useAppSelector((state) => state.auth.instituteId);
  const methods = useForm<CourseFormValidation>({
    resolver: zodResolver(courseSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    clearErrors,
    control,
    formState: { errors },
  } = methods;
  const {
    fields: installmentFields,
    append,
    replace,
    remove,
  } = useFieldArray({
    control,
    name: "installments",
  });
  const handleDeleteTemplate = () => {
    // Disable template
    setValue("createTemplate", false);

    // Reset template status
    setValue("templateStatus", "Inactive");

    // Clear all interval selections/inputs
    setValue("intervalOption", "Fixed");
    setValue("fixedDays", "");
    setValue("monthlyDueDate", "");
    setValue("quarterlyDueDate", "");

    // Clear RHF installment values
    replace([]);

    // Clear validation errors
    clearErrors([
      "templateStatus",
      "intervalOption",
      "fixedDays",
      "monthlyDueDate",
      "quarterlyDueDate",
      "installments",
    ]);

    // Clear generated template table
    setTemplateRows([]);

    // Clear total
    setTemplateTotal(0);

    // Hide installment table
    setIsIntervalSet(false);
  };
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const createTemplate = watch("createTemplate");
  const showAllStaff = watch("showAllStaff");
  const intervalOption = watch("intervalOption");
  const courseFee = watch("courseFee");
  const [hasStudentsAssigned, setHasStudentsAssigned] = useState(false);
  const [hasStudentsAssignedToAdhoc, setHasStudentsAssignedToAdhoc] =
    useState(false);

  const disableFeeType = hasStudentsAssigned || hasStudentsAssignedToAdhoc;
  const hasCourseFee = Number(courseFee) > 0;
  useEffect(() => {
    if (intervalOption === "Fixed") {
      setValue("monthlyDueDate", "");
      setValue("quarterlyDueDate", "");
    } else if (intervalOption === "Monthly") {
      setValue("fixedDays", "");
      setValue("quarterlyDueDate", "");
    } else if (intervalOption === "Quarterly") {
      setValue("fixedDays", "");
      setValue("monthlyDueDate", "");
    }
  }, [intervalOption, setValue]);
  const feeType = watch("feeType");
  useEffect(() => {
    if (feeType === "Session Wise Fee") {
      // Delete/clear existing installment template details
      setValue("createTemplate", false);
      setValue("templateStatus", "Inactive");

      setValue("intervalOption", "Fixed");
      setValue("fixedDays", "");
      setValue("monthlyDueDate", "");
      setValue("quarterlyDueDate", "");

      replace([]);

      clearErrors([
        "templateStatus",
        "intervalOption",
        "fixedDays",
        "monthlyDueDate",
        "quarterlyDueDate",
        "installments",
      ]);

      setTemplateRows([]);
      setTemplateTotal(0);
      setIsIntervalSet(false);
    }
  }, [feeType, setValue, replace, clearErrors]);
  const installments = watch("installments") ?? [];
  const adhocInstallment = watch("adhocInstallment");
  useEffect(() => {
    if (!adhocInstallment) return;

    // Disable template
    setValue("createTemplate", false);

    // Reset template status
    setValue("templateStatus", "Inactive");

    // Clear interval selections/inputs
    setValue("intervalOption", "Fixed");
    setValue("fixedDays", "");
    setValue("monthlyDueDate", "");
    setValue("quarterlyDueDate", "");

    // Clear RHF installment values
    replace([]);

    // Clear validation errors
    clearErrors([
      "templateStatus",
      "intervalOption",
      "fixedDays",
      "monthlyDueDate",
      "quarterlyDueDate",
      "installments",
    ]);

    // Clear generated template table
    setTemplateRows([]);

    // Clear total
    setTemplateTotal(0);

    // Hide installment table
    setIsIntervalSet(false);
  }, [adhocInstallment, setValue, replace, clearErrors]);
  const installmentAllowed = watch("installmentAllowed");
  const courseLevelFees = watch("courseLevelFees");
  const handleTemplateAmountChange = (srNo: number, value: string) => {
    setTemplateRows((prev) =>
      prev.map((row) =>
        row.srNo === srNo
          ? {
              ...row,
              amount: Number(value) || 0,
            }
          : row,
      ),
    );
  };
  // useEffect(() => {
  //   if (courseLevelFees) {
  //     setValue("createTemplate", false);
  //   }
  // }, [courseLevelFees, setValue]);
  const totalInstallmentAmount = installments.reduce(
    (total, installment) => total + (Number(installment.amount) || 0),
    0,
  );
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [counsellors, setCounsellors] = useState<Staff[]>([]);
  const allStaffFetched = useRef(false);
  const courseName = watch("courseClassName");

  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [curriculums, setCurriculums] = useState<CurriculumList[]>([]);

  console.log("COURSE PAGE BRANCH ID:", branchId);
  const [templateRows, setTemplateRows] = useState<InstallmentTemplateRow[]>(
    [],
  );

  const [templateTotal, setTemplateTotal] = useState(0);
  const [isIntervalSet, setIsIntervalSet] = useState(false);
  const validateTemplateSetup = () => {
    const courseFee = Number(watch("courseFee"));
    const maxInstallments = Number(watch("maxInstallments"));

    if (courseFee <= 0) {
      toast.error("Course/Class Fee must be greater than 0");
      return false;
    }

    if (maxInstallments <= 0) {
      toast.error("Maximum Installment must be greater than 0");
      return false;
    }

    return true;
  };
  const handleFixedSet = async () => {
    const courseFee = Number(watch("courseFee"));
    const maxInstallment = Number(watch("maxInstallments"));
    const day = Number(watch("fixedDays"));

    if (courseFee <= 0) {
      toast.error("Course/Class Fee must be greater than 0");
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
        courseFee,
        maxInstallment,
        day,
        branchId,
      });

      console.log("FIXED INSTALLMENT RESPONSE:", response);

      const templateData = response?.data;

      setTemplateRows(templateData?.templates ?? []);
      setTemplateTotal(templateData?.totalAmount ?? 0);
      setIsIntervalSet(true);
    } catch (error) {
      console.error("Failed to set fixed installment:", error);
    }
  };

  const handleMonthlySet = async () => {
    const courseFee = Number(watch("courseFee"));
    const maxInstallment = Number(watch("maxInstallments"));
    const day = Number(watch("monthlyDueDate"));

    if (courseFee <= 0) {
      toast.error("Course/Class Fee must be greater than 0");
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
        courseFee,
        maxInstallment,
        day,
        branchId,
      });

      console.log("MONTHLY INSTALLMENT RESPONSE:", response);

      const templateData = response?.data;

      setTemplateRows(templateData?.templates ?? []);
      setTemplateTotal(templateData?.totalAmount ?? 0);
      setIsIntervalSet(true);
    } catch (error) {
      console.error("Failed to set monthly installment:", error);
    }
  };
  const handleQuarterlySet = async () => {
    const courseFee = Number(watch("courseFee"));
    const maxInstallment = Number(watch("maxInstallments"));
    const day = Number(watch("quarterlyDueDate"));

    if (courseFee <= 0) {
      toast.error("Course/Class Fee must be greater than 0");
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
        courseFee,
        maxInstallment,
        day,
        branchId,
      });

      console.log("QUARTERLY INSTALLMENT RESPONSE:", response);

      const templateData = response?.data;

      setTemplateRows(templateData?.templates ?? []);
      setTemplateTotal(templateData?.totalAmount ?? 0);
      setIsIntervalSet(true);
    } catch (error) {
      console.error("Failed to set quarterly installment:", error);
    }
  };
  const visibleStaff = showAllStaff
    ? [
        ...counsellors,
        ...allStaff.filter(
          (staff) =>
            !counsellors.some(
              (counsellor) =>
                Number(counsellor.trainerId) === Number(staff.trainerId),
            ),
        ),
      ]
    : counsellors;
  useEffect(() => {
    const total = templateRows.reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0,
    );

    setTemplateTotal(total);
  }, [templateRows]);
  useEffect(() => {
    const fetchCounsellors = async () => {
      if (!instituteId || !branchId) return;

      try {
        const staff = await getCounsellors(instituteId, branchId);
        setCounsellors(staff);
      } catch (error) {
        console.error("Failed to fetch counsellors:", error);
      }
    };

    fetchCounsellors();
  }, [instituteId, branchId]);
  useEffect(() => {
    if (!showAllStaff || !instituteId || !branchId) return;

    if (allStaffFetched.current) return;

    const fetchAllStaff = async () => {
      try {
        const staff = await getAllStaff(instituteId, branchId);

        setAllStaff(staff);
        allStaffFetched.current = true;
      } catch (error) {
        console.error("Failed to fetch all staff:", error);
      }
    };

    fetchAllStaff();
  }, [showAllStaff, instituteId, branchId]);
  useEffect(() => {
    const loadCurriculums = async () => {
      try {
        console.log("CALLING GET CURRICULUMS WITH BRANCH:", branchId);

        const response = await getCurriculums({
          pageNumber: 1,
          pageSize: 1000,
          curriculumName: "",
          status: 1,
          branchId: branchId,
        });

        console.log("CURRICULUM RESPONSE:", response);

        setCurriculums(response.items ?? []);
      } catch (error) {
        console.error("Failed to load curriculums:", error);
      }
    };

    loadCurriculums();
  }, [branchId]);
  useEffect(() => {
    if (!isEdit || !courseId) return;

    const loadCourse = async () => {
      try {
        console.log("CALLING GET COURSE BY ID:", courseId);

        const response = await getCourseById(courseId);

        console.log("GET COURSE BY ID RESPONSE:", response);

        const course = response?.data;
        if (!course) {
          toast.error("Course details not found");
          return;
        }
        setHasStudentsAssigned(course?.hasStudentsAssigned === true);
        setHasStudentsAssignedToAdhoc(
          course?.hasStudentsAssignedToAdhoc === true,
        );
        const templateInstallments = Array.isArray(course.templateInstallments)
          ? course.templateInstallments
          : [];

        setTemplateRows(templateInstallments);

        setTemplateTotal(
          templateInstallments.reduce(
            (sum: number, item: any) => sum + (Number(item.amount) || 0),
            0,
          ),
        );

        setIsIntervalSet(templateInstallments.length > 0);

        if (!course) {
          toast.error("Course details not found");
          return;
        }
        const paymentTemplate = course.paymentTemplate;
        const fetchedPaymentTemplateId =
          Number(
            paymentTemplate?.paymentTemplateId ?? course.paymentTemplateId,
          ) || 0;

        console.log("FETCHED PAYMENT TEMPLATE ID:", fetchedPaymentTemplateId);

        paymentTemplateIdRef.current = fetchedPaymentTemplateId;

        console.log("PAYMENT TEMPLATE OBJECT:", paymentTemplate);
        console.log(
          "PAYMENT TEMPLATE ID FROM RESPONSE:",
          paymentTemplate?.paymentTemplateId,
        );
        console.log(
          "COURSE ROOT PAYMENT TEMPLATE ID:",
          course.paymentTemplateId,
        );
        const originalStatus =
          course.status === "Active" ? "Active" : "Inactive";

        originalStatusRef.current = originalStatus;
        reset({
          ...DEFAULT_FORM_VALUES,

          // Basic course details
          courseClassName: course.course_Name ?? "",
          curriculumId: Number(course.crclmId) || 0,
          description: course.description ?? "",

          // Duration
          duration: String(course.duration ?? ""),

          durationUnit:
            Number(course.duration_Type) === 1
              ? "Year"
              : Number(course.duration_Type) === 2
                ? "Months"
                : Number(course.duration_Type) === 3
                  ? "Days"
                  : Number(course.duration_Type) === 4
                    ? "Hours"
                    : Number(course.duration_Type) === 5
                      ? "Session"
                      : "Year",
          // Course level fees
          courseLevelFees: Number(course.isCourseLvl) === 1,

          // Fees
          courseFee: String(course.courseFees ?? "0"),

          // Tax
          isTaxable: String(course.cTaxable).toLowerCase() === "true",

          includingTax: String(course.cIncluding_Tax).toLowerCase() === "true",

          // Installments
          installmentAllowed:
            String(course.cAllow_Installment).toLowerCase() === "true",

          maxInstallments: String(course.cMax_Installment ?? "1"),

          // Course information
          courseType: course.courseType ?? "",
          hsncode: course.hsncode ?? "",
          type: course.courseType ?? "",

          // Adhoc
          adhocInstallment: Number(course.adhocCourse) === 1,

          // Fee type
          feeType:
            Number(course.courseFeeWise) === 1
              ? "Full Course Fee"
              : "Session Wise Fee",

          // Payment template
          createTemplate: course.paymentTemplate != null,
          status: course.status === "Active" ? "Active" : "Inactive",
          templateStatus: course.paymentTemplate?.statusFlag
            ? "Active"
            : "Inactive",

          intervalOption:
            Number(course.paymentTemplate?.templateType) === 1
              ? "Fixed"
              : Number(course.paymentTemplate?.templateType) === 2
                ? "Monthly"
                : "Quarterly",

          fixedDays:
            Number(course.paymentTemplate?.templateType) === 1
              ? String(course.paymentTemplate?.noofDays ?? "")
              : "",

          monthlyDueDate:
            Number(course.paymentTemplate?.templateType) === 2
              ? String(course.paymentTemplate?.noofDays ?? "")
              : "",

          quarterlyDueDate:
            Number(course.paymentTemplate?.templateType) === 3
              ? String(course.paymentTemplate?.noofDays ?? "")
              : "",

          // Staff
          // Staff
          showAllStaff:
            Array.isArray(course.trainerIds) && course.trainerIds.length > 0,

          selectedStaffIds: Array.isArray(course.trainerIds)
            ? course.trainerIds.map(Number)
            : [],

          // Installment details
          installments: Array.isArray(course.templateInstallments)
            ? course.templateInstallments.map((item: any) => ({
                intervalDays: Number(item.dayOfMonth) || 0,
                amount: String(item.amount ?? "0.00"),
              }))
            : DEFAULT_FORM_VALUES.installments,
        });
      } catch (error) {
        console.error("Failed to load course:", error);
      }
    };

    loadCourse();
  }, [isEdit, courseId, reset]);
  const skipZeroFeeConfirmation = useRef(false);
  const handleConfirmZeroFee = async () => {
    if (!pendingFormData) return;

    skipZeroFeeConfirmation.current = true;

    const data = pendingFormData;

    setPendingFormData(null);
    setShowZeroFeeModal(false);

    await onSubmit(data);
  };

  const handleCancelZeroFee = () => {
    setPendingFormData(null);
    setShowZeroFeeModal(false);
  };
  const onSubmit = async (data: CourseFormValidation) => {
    if (
      !skipZeroFeeConfirmation.current &&
      data.courseLevelFees &&
      Number(data.courseFee) === 0
    ) {
      const feeLabel =
        feeType === "Session Wise Fee" ? "Per Session Fee" : "Course/Class Fee";

      setPendingFormData(data);
      setShowZeroFeeModal(true);
      return;
    }
    if (isEdit && data.status !== originalStatusRef.current) {
      const confirmed = window.confirm(
        `Course status was "${originalStatusRef.current}". Are you sure you want to change it to "${data.status}"?`,
      );

      if (!confirmed) {
        return;
      }
    }
    const templateAmountTotal = templateRows.reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0,
    );

    const courseFee = Number(data.courseFee) || 0;
    const maxInstallments = Number(data.maxInstallments) || 0;

    // Validate template only when it is created
    // if (data.createTemplate) {
    //   // Maximum installments must match template installment count
    //   if (maxInstallments !== templateRows.length) {
    //     toast.error(
    //       `Maximum Installment (${maxInstallments}) must match the number of template installments (${templateRows.length}).`,
    //     );
    //     return;
    //   }

    //   // Template total must match course fee
    //   if (templateAmountTotal !== courseFee) {
    //     toast.error(
    //       `Template installment total ${templateAmountTotal.toFixed(
    //         2,
    //       )} must match course fee ${courseFee.toFixed(2)}`,
    //     );
    //     return;
    //   }
    // }

    try {
      const payload: CreateCourseRequest = {
        ...(isEdit && courseId ? { courseId } : {}),

        courseName: data.courseClassName,
        description: data.description ?? "",
        duration: Number(data.duration) || 0,

        durationType:
          data.durationUnit === "Year"
            ? 1
            : data.durationUnit === "Months"
              ? 2
              : data.durationUnit === "Days"
                ? 3
                : data.durationUnit === "Hours"
                  ? 4
                  : data.durationUnit === "Session"
                    ? 5
                    : 0,

        crclmId: Number(data.curriculumId) || 0,

        isCourseLvl: data.courseLevelFees ?? false,

        courseFee: Number(data.courseFee) || 0,

        taxable: data.isTaxable ?? false,

        includingTax: data.includingTax ?? false,

        allowInstallment: data.installmentAllowed ?? false,

        maxInstallment: Number(data.maxInstallments) || 0,

        type: data.type ?? "",

        hsncode: data.hsncode ?? "",

        adhocCourse: data.adhocInstallment ? 1 : 0,

        courseFeeWise: data.feeType === "Full Course Fee" ? 1 : 2,

        paymentTemplateId: isEdit ? paymentTemplateIdRef.current : 0,
        isCreateTemplate: data.createTemplate ?? false,

        templateStatus: data.templateStatus === "Active",

        templateType:
          data.intervalOption === "Fixed"
            ? 1
            : data.intervalOption === "Monthly"
              ? 2
              : 3,

        noofDays:
          data.intervalOption === "Fixed"
            ? Number(data.fixedDays) || 0
            : data.intervalOption === "Monthly"
              ? Number(data.monthlyDueDate) || 0
              : Number(data.quarterlyDueDate) || 0,

        templateDetails: templateRows.map(
          (row) => `${Number(row.dayOfMonth) || 0}#${Number(row.amount) || 0}`,
        ),

        trainerIds: (data.selectedStaffIds ?? []).map(Number),

        branchId: branchId,

        status: isEdit ? (data.status === "Active" ? 1 : 0) : 1,
      };

      console.log("CREATE COURSE PAYLOAD:", payload);

      if (isEdit) {
        const response = await updateCourse(payload);

        console.log("UPDATE COURSE RESPONSE:", response);

        // Fetch only the updated course
        const updatedResponse = await getCourseById(courseId!);

        console.log("UPDATED COURSE:", updatedResponse);

        const updatedCourse = updatedResponse?.data;

        if (updatedCourse) {
          updateCourseRow(updatedCourse);
        }

        toast.success("Course updated successfully");
      } else {
        const response = await createCourse(payload);

        console.log("CREATE COURSE RESPONSE:", response);

        toast.success("Course created successfully");

        await resetCoursesPagination();
      }

      navigate("/managecourses");
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };
  const isTaxable = watch("isTaxable");

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-50">
        {/* Main Header */}
        <PageHeader
          description={isEdit ? "Update course details" : "Create a new course"}
          extraBreadcrumbs={[
            {
              label: isEdit
                ? `Edit Course - ${courseName || "Course"}`
                : "Add Course",
            },
          ]}
        />
        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("FORM VALIDATION ERRORS:", errors);
          })}
        >
          {/* SECTION 1: Branch Details Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {/* Custom Section Title matching image format */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 stroke-[2]" />
              </div>
              <h2 className="text-lg font-bold text-[#0F4C81]">
                Basic Course Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dropdown
                  name="curriculumId"
                  disabled={isEdit}
                  label="Curriculum Name"
                  options={[...curriculums]
                    .sort((a, b) => {
                      const nameA = a.CurriculumName.trim();
                      const nameB = b.CurriculumName.trim();

                      const startsWithNumberA = /^\d/.test(nameA);
                      const startsWithNumberB = /^\d/.test(nameB);

                      // Numbers first
                      if (startsWithNumberA && !startsWithNumberB) return -1;
                      if (!startsWithNumberA && startsWithNumberB) return 1;

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
                    .map((curriculum) => ({
                      label: curriculum.CurriculumName,
                      value: curriculum.CurriculumId,
                    }))}
                />
                <div>
                  <label className={lbl}>
                    Course/Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("courseClassName")}
                    className={`${inp} ${
                      errors.courseClassName
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : ""
                    }`}
                    placeholder="Enter Course/Class Name"
                  />

                  {errors.courseClassName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.courseClassName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Type</label>
                  <input
                    type="text"
                    {...register("type")}
                    className={`${inp} ${
                      errors.type
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : ""
                    }`}
                    placeholder="Enter Type"
                  />
                  <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                    <p className="text-sm font-medium text-[#0F4C81]">
                      Course Type
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      Helps distinguish different categories of courses.
                    </p>
                  </div>
                </div>
                <div>
                  <label className={lbl}>HSN/SAC Code</label>
                  <input
                    type="text"
                    {...register("hsncode")}
                    className={`${inp} ${
                      errors.hsncode
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : ""
                    }`}
                    placeholder="Enter HSN/SAC code"
                  />{" "}
                  <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                    <p className="text-sm font-medium text-[#0F4C81]">
                      HSN/SAC codes are used for GST classification.
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      Helps maintain accurate tax calculation, billing, and GST
                      reporting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Duration</label>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <input
                        type="text"
                        {...register("duration")}
                        className={`${inp} ${
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
                      <Dropdown
                        name="durationUnit"
                        options={[
                          { label: "Year", value: "Year" },
                          { label: "Months", value: "Months" },
                          { label: "Days", value: "Days" },
                          { label: "Hours", value: "Hours" },
                          { label: "Session", value: "Session" },
                        ]}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Description</label>

                  <textarea
                    {...register("description")}
                    className={`${inp} min-h-[100px] resize-y ${
                      errors.description
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : ""
                    }`}
                    rows={4}
                    placeholder="Enter description..."
                  />

                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {branchId !== 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`${lbl} flex items-center gap-1.5 mb-0`}>
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      Assign Enquiry To Users
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#0F4C81]">
                      <input
                        type="checkbox"
                        {...register("showAllStaff")}
                        className="w-3.5 h-3.5 accent-[#0F4C81] rounded"
                      />
                      Show All Staff
                    </label>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 max-h-36 overflow-y-auto space-y-2 bg-slate-50/50">
                    {visibleStaff.length > 0 ? (
                      visibleStaff.map((staff) => {
                        const staffId = Number(staff.trainerId);
                        const selectedIds = watch("selectedStaffIds") ?? [];

                        return (
                          <label
                            key={staffId}
                            className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 select-none"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(staffId)}
                              onChange={(e) => {
                                const currentIds =
                                  watch("selectedStaffIds") ?? [];

                                if (e.target.checked) {
                                  setValue(
                                    "selectedStaffIds",
                                    currentIds.includes(staffId)
                                      ? currentIds
                                      : [...currentIds, staffId],
                                    { shouldValidate: true },
                                  );
                                } else {
                                  setValue(
                                    "selectedStaffIds",
                                    currentIds.filter((id) => id !== staffId),
                                    { shouldValidate: true },
                                  );
                                }
                              }}
                              className="w-4 h-4 accent-[#0F4C81] rounded"
                            />

                            <span>{staff.name}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-2">
                        No users found
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Main Functional Controller Checkbox */}
              <div className="pt-3 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("courseLevelFees")}
                    className="w-4 h-4 accent-[#0F4C81] rounded"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    Course/Class Level Fees
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: Conditional Fee Configuration */}
          {courseLevelFees && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 stroke-[2]" />
                </div>
                <h2 className="text-lg font-bold text-[#0F4C81]">
                  Fee Configuration
                </h2>
              </div>

              <div className="space-y-4">
                {/* Fee Type & Adhoc Installment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Course/Class Fee Type</label>

                    <div className="flex gap-6 mt-1">
                      {["Full Course Fee", "Session Wise Fee"].map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-2 text-sm ${
                            disableFeeType
                              ? "cursor-not-allowed text-gray-400"
                              : "cursor-pointer text-gray-700"
                          }`}
                        >
                          <input
                            type="radio"
                            value={opt}
                            {...register("feeType")}
                            disabled={disableFeeType}
                            className="w-4 h-4 accent-[#0F4C81] disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>
                      {feeType === "Session Wise Fee"
                        ? "Per Session Fee"
                        : "Course/Class Fee"}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        {...register("courseFee")}
                        className={`${inp}${
                          errors.courseFee
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : ""
                        }`}
                        placeholder="0.00"
                      />
                    </div>

                    {errors.courseFee && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.courseFee.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Course Fee & Taxable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Taxable</label>

                    <Controller
                      name="isTaxable"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-6 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="w-4 h-4 accent-[#0F4C81]"
                            />
                            Yes
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                            <input
                              type="radio"
                              checked={field.value === false}
                              onChange={() => field.onChange(false)}
                              className="w-4 h-4 accent-[#0F4C81]"
                            />
                            No
                          </label>
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Tax Calculation</label>

                    <Controller
                      name="includingTax"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-6 mt-1">
                          <label
                            className={`flex items-center gap-2 text-sm ${
                              isTaxable
                                ? "cursor-pointer text-gray-700"
                                : "cursor-not-allowed text-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              disabled={!isTaxable}
                              className="w-4 h-4 accent-[#0F4C81] disabled:opacity-50"
                            />
                            Including Tax
                          </label>

                          <label
                            className={`flex items-center gap-2 text-sm ${
                              isTaxable
                                ? "cursor-pointer text-gray-700"
                                : "cursor-not-allowed text-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              checked={field.value === false}
                              onChange={() => field.onChange(false)}
                              disabled={!isTaxable}
                              className="w-4 h-4 accent-[#0F4C81] disabled:opacity-50"
                            />
                            Excluding Tax
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Installment Allowed & Maximum Installment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-3 border-t border-gray-100">
                  <div className="pt-4 sm:pt-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("adhocInstallment")}
                        disabled={feeType === "Session Wise Fee"}
                        className="w-4 h-4 accent-[#0F4C81] rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Adhoc Course Installment
                      </span>
                    </label>
                  </div>
                </div>
                {feeType === "Full Course Fee" && !adhocInstallment && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {" "}
                    <div>
                      <label className={lbl}>Installment Allowed</label>

                      <Controller
                        name="installmentAllowed"
                        control={control}
                        render={({ field }) => (
                          <div className="flex gap-6 mt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                              <input
                                type="radio"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                                className="w-4 h-4 accent-[#0F4C81]"
                              />
                              Yes
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                              <input
                                type="radio"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                                className="w-4 h-4 accent-[#0F4C81]"
                              />
                              No
                            </label>
                          </div>
                        )}
                      />
                    </div>
                    <div>
                      <label
                        className={`${lbl} ${
                          !installmentAllowed ? "text-gray-400" : ""
                        }`}
                      >
                        Maximum Installment{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        {...register("maxInstallments")}
                        disabled={!installmentAllowed}
                        className={`${inp} ${
                          !installmentAllowed
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : ""
                        } ${
                          errors.maxInstallments
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : ""
                        }`}
                        placeholder="Enter maximum installments"
                      />
                      {errors.maxInstallments && installmentAllowed && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.maxInstallments.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Template Checkbox Control */}
                <div className="pt-3 border-t border-gray-100 flex items-center">
                  {feeType === "Full Course Fee" &&
                    hasCourseFee &&
                    !adhocInstallment &&
                    installmentAllowed && (
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
                          disabled={
                            !createTemplate || templateRows.length === 0
                          }
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
                    )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Conditional Template Configuration Container */}
          {courseLevelFees &&
            feeType === "Full Course Fee" &&
            hasCourseFee &&
            createTemplate &&
            !adhocInstallment &&
            installmentAllowed && (
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
                          <input
                            type="radio"
                            value={s}
                            {...register("templateStatus")}
                            className="w-4 h-4 accent-[#0F4C81]"
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
                      <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap w-[260px]">
                        <input
                          type="radio"
                          value="Fixed"
                          {...register("intervalOption", {
                            onChange: () => {
                              setValue("monthlyDueDate", "");
                              setValue("quarterlyDueDate", "");

                              // Clear generated template
                              setTemplateRows([]);
                              replace([]);
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
                          {...register("fixedDays")}
                          className={`${inp} w-28 ${
                            intervalOption !== "Fixed"
                              ? "bg-gray-100 cursor-not-allowed opacity-60"
                              : ""
                          } ${
                            errors.fixedDays
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                              : ""
                          }`}
                          placeholder="Days"
                          disabled={intervalOption !== "Fixed"}
                        />

                        {errors.fixedDays && (
                          <p className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap">
                            {errors.fixedDays.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={intervalOption !== "Fixed"}
                        onClick={handleFixedSet}
                        className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#0c3d6a] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                      >
                        Set
                      </button>
                    </div>
                    {/* Option 2: Monthly */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap w-[260px]">
                        <input
                          type="radio"
                          value="Monthly"
                          {...register("intervalOption", {
                            onChange: () => {
                              setValue("fixedDays", "");
                              setValue("quarterlyDueDate", "");

                              // Clear generated template
                              setTemplateRows([]);
                              replace([]);
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
                          {...register("monthlyDueDate")}
                          className={`${inp} w-28 ${
                            intervalOption !== "Monthly"
                              ? "bg-gray-100 cursor-not-allowed opacity-60"
                              : ""
                          } ${
                            errors.monthlyDueDate
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                              : ""
                          }`}
                          placeholder="Due Date"
                          disabled={intervalOption !== "Monthly"}
                        />

                        {errors.monthlyDueDate && (
                          <p className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap">
                            {errors.monthlyDueDate.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={intervalOption !== "Monthly"}
                        onClick={handleMonthlySet}
                        className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#0c3d6a] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                      >
                        Set
                      </button>
                    </div>

                    {/* Option 3: Quarterly */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap w-[260px]">
                        <input
                          type="radio"
                          value="Quarterly"
                          {...register("intervalOption", {
                            onChange: () => {
                              setValue("fixedDays", "");
                              setValue("monthlyDueDate", "");

                              // Clear generated template
                              setTemplateRows([]);
                              replace([]);
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
                          {...register("quarterlyDueDate")}
                          className={`${inp} w-28 ${
                            intervalOption !== "Quarterly"
                              ? "bg-gray-100 cursor-not-allowed opacity-60"
                              : ""
                          } ${
                            errors.quarterlyDueDate
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                              : ""
                          }`}
                          placeholder="Due Date"
                          disabled={intervalOption !== "Quarterly"}
                        />
                        {errors.quarterlyDueDate && (
                          <p className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap">
                            {errors.quarterlyDueDate.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={intervalOption !== "Quarterly"}
                        onClick={handleQuarterlySet}
                        className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#0c3d6a] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                      >
                        Set
                      </button>
                    </div>
                  </div>

                  {/* Installment Items Table */}
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
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input
                        type="radio"
                        value="Active"
                        checked={field.value === "Active"}
                        onChange={() => field.onChange("Active")}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />
                      Active
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input
                        type="radio"
                        value="Inactive"
                        checked={field.value === "Inactive"}
                        onChange={() => field.onChange("Inactive")}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />
                      Inactive
                    </label>
                  </div>
                )}
              />
            </div>
          )}
          {/* Bottom Action Bar */}
          <div>
            <ValidationErrorSummary />
            <div className="mt-4 flex items-center justify-start gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isEdit ? "Update" : "Save"}
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
          {showZeroFeeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-7 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#0F4C81]/10 p-2">
                      <AlertCircle className="h-6 w-6 text-[#0F4C81]" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">Confirm</h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelZeroFee}
                    className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 py-6">
                  <p className="text-lg font-bold text-gray-900">
                    {feeType === "Session Wise Fee"
                      ? "Per Session Fee"
                      : "Course/Class Fee"}{" "}
                    is set to 0.
                  </p>

                  <p className="text-[16px] leading-relaxed text-gray-600">
                    Are you sure you want to proceed?
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={handleConfirmZeroFee}
                    className="cursor-pointer rounded-xl bg-[#0F4C81] px-7 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0c3d6a]"
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelZeroFee}
                    className="cursor-pointer rounded-xl border border-gray-300 px-7 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </FormProvider>
  );
}
