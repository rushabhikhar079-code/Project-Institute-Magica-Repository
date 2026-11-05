import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import EnquiryStepper from "./components/addEnquiry/EnquiryStepper";
import RegistrationPersonal from "./components/addEnquiry/InfoPersonal";
import Academic from "./components/addEnquiry/Academic";
import FamilyWork from "./components/addEnquiry/FamilyWork";
import Education from "./components/addEnquiry/Education";
import Remarks from "./components/addEnquiry/Remarks";

import {
  educationQualificationSchema,
  enquirySchema,
  type EnquiryFormData,
} from "./validations/enquirySchema";

import {
  addEnquiry,
  AddEnquiryPayload,
  getStudentById,
} from "./enquiryService";
import { useAppSelector } from "../../../redux/hooks";
import ValidationErrorSummary from "../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../redux/slices/errorSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
type EnquiryOutletContext = {
  setStudentName: (name: string) => void;
};
const steps = [
  "Enquiry\n& Personal",
  "Academic",
  "Family &\nWork",
  "Education",
  "Remarks",
];
const getTodayDate = (): string => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
};
export default function AddEnquiry() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const branchId = useAppSelector((state) => state.branch.branchId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { studentId } = useParams<{ studentId: string }>();
  const { setStudentName } = useOutletContext<EnquiryOutletContext>();

  const isEditMode = Boolean(studentId);
  console.log("Edit Mode:", isEditMode);
  console.log("Student ID:", studentId);
  useEffect(() => {
    if (!studentId || !branchId) {
      return;
    }

    const loadStudent = async () => {
      try {
        const response = await getStudentById(Number(studentId), branchId);

        console.log("Get Student By ID response:", response);

        const student = response.data;
        if (student?.photo) {
          setExistingPhoto(`data:image/jpeg;base64,${student.photo}`);
        } else {
          setExistingPhoto(null);
        }
        console.log("EXISTING PHOTO:", existingPhoto);
        const fullName = [
          student?.firstName,
          student?.middleName,
          student?.lastName,
        ]
          .filter(Boolean)
          .join(" ");

        setStudentName(fullName);

        const formData = mapStudentToForm(student);

        methods.reset(formData);
      } catch (error) {
        console.error("Failed to get student:", error);
      }
    };

    loadStudent();
  }, [studentId, branchId]);
  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);

  const defaultFormValues: EnquiryFormData = {
    RegDate: "",
    RegNo_Manual: "",
    EnquiryDate: getTodayDate(),
    EnqStatus: "",
    Source: "",
    Registered: "",
    ActiveStatus: "",
    StatusFlag: 1,
    FollowUpRequired: false,
    Followup: "",
    FollowupReminder: 0,
    FollowDate: "",
    FollowTime: "",
    walkIn: false,
    walkInDate: "",

    remark: "",
    newremarks: "",

    Image: null,
    Fname: "",
    Mname: "",
    Lname: "",
    Salutation: "",
    Gender: "",
    DOB: "",
    Age: "",
    Stud_Category: "",
    biometricattendanceid: "",

    PContact: "",
    FMobile: "",
    MMobile: "",
    HomeNo: "",
    EmailId: "",

    CorrAddress: "",
    countryidc: "",
    stateidc: "",
    cityidc: "",
    othercityc: "",
    state: "",
    city: "",
    District: "",
    pincode: "",

    PermanentAdd: "",
    countryid: "",
    stateid: "",
    cityid: "",
    othercity: "",
    stateC: "",
    cityC: "",
    DistrictC: "",
    pincodeC: "",

    FatherFName: "",
    FatherMName: "",
    FatherLName: "",
    MotherFName: "",
    MotherMName: "",
    MotherLName: "",
    ParentCompanyName: "",
    GSTNumber: "",

    Working: "",
    Occupation: "",
    OrgName: "",
    Salary: "",

    Comments: "",
    ValidUpto: "",
    Username: "",
    Password: "",
    InactiveStatus: "",
    AttendanceID: "",
    userid: "",
    Rollno: "",

    selectedSubjects: "",
    selectedCourses: "",
    otherFeesIds: "",
    batchIds: [],
    selectedCourseSubjects: {},
    selectedBatchIds: [],

    Degree: "",
    Collegename: "",
    Stream: "",
    Percentage: "",
    Year1: "",
    EducationQualifications: [],
  };

  const methods = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultFormValues,
  });
  /*
   * ============================================================
   * EDUCATION
   * ============================================================
   */
  const mapSelectedCourseSubjects = (
    selectedCourses: string,
    selectedSubjects: string,
  ): Record<number, number[]> => {
    const result: Record<number, number[]> = {};

    // --------------------------------------------------
    // Selected courses
    // "10168,10175"
    // --------------------------------------------------
    selectedCourses
      ?.split(",")
      .map(Number)
      .filter(Boolean)
      .forEach((courseId) => {
        result[courseId] = [];
      });

    // --------------------------------------------------
    // Selected subjects
    //
    // 19310#Full Subject Fees#10/06/2026#0#10168
    //  ^ subjectId                         ^ courseId
    // --------------------------------------------------
    selectedSubjects
      ?.split(",")
      .filter(Boolean)
      .forEach((item) => {
        const parts = item.split("#");

        const subjectId = Number(parts[0]);
        const courseId = Number(parts[4]);

        if (!subjectId || !courseId) {
          return;
        }

        if (!result[courseId]) {
          result[courseId] = [];
        }

        if (!result[courseId].includes(subjectId)) {
          result[courseId].push(subjectId);
        }
      });

    return result;
  };
  const mapStudentToForm = (student: any): EnquiryFormData => {
    return {
      ...defaultFormValues,

      // Registration / Enquiry
      RegDate: student.regDate ?? "",
      RegNo_Manual: student.regNo ?? "",
      EnquiryDate: student.enquiryDate ?? "",
      EnqStatus: student.enqStatus != null ? String(student.enqStatus) : "",
      ActiveStatus: student.status != null ? String(student.status) : "",

      walkIn: student.walkIn === "1",
      walkInDate: student.walkInDate ?? "",

      // Personal
      Fname: student.firstName ?? "",
      Mname: student.middleName ?? "",
      Lname: student.lastName ?? "",
      Salutation: student.salutation != null ? String(student.salutation) : "",
      Gender: student.gender != null ? String(student.gender) : "",
      DOB: student.dateOfBirth ?? "",
      Age: student.age != null ? String(student.age) : "",
      Stud_Category: student.category ?? "",
      biometricattendanceid: student.biometricAttendanceId ?? "",

      PContact: student.mobile ?? "",
      EmailId: student.email ?? "",
      HomeNo: student.homePhone ?? "",

      // Correspondence
      CorrAddress: student.address ?? "",
      countryidc: student.countryId != null ? String(student.countryId) : "",
      stateidc: student.stateId != null ? String(student.stateId) : "",
      cityidc: student.cityId != null ? String(student.cityId) : "",
      othercityc: student.otherCity ?? "",
      pincode: student.pinCode ?? "",

      // Permanent
      PermanentAdd: student.permanentAddress ?? "",
      countryid: student.countryIdC != null ? String(student.countryIdC) : "",
      stateid: student.stateIdC != null ? String(student.stateIdC) : "",
      cityid: student.cityIdC != null ? String(student.cityIdC) : "",
      othercity: student.otherCityC ?? "",
      pincodeC: student.pinCodeC ?? "",

      // Academic
      selectedSubjects: student.selectedSubjects ?? "",
      selectedCourses: student.selectedCourses ?? "",
      otherFeesIds: student.otherFeesIds ?? "",
      batchIds: student.batchIds ?? [],

      selectedCourseSubjects: mapSelectedCourseSubjects(
        student.selectedCourses ?? "",
        student.selectedSubjects ?? "",
      ),

      selectedBatchIds: student.batchIds ?? [],

      // Family
      FatherFName: student.fatherFirstName ?? "",
      FatherMName: student.fatherMiddleName ?? "",
      FatherLName: student.fatherLastName ?? "",
      FMobile: student.mobile1 ?? "",

      MotherFName: student.motherFirstName ?? "",
      MotherMName: student.motherMiddleName ?? "",
      MotherLName: student.motherLastName ?? "",
      MMobile: student.mobile2 ?? "",

      ParentCompanyName: student.parentCompanyName ?? "",
      GSTNumber: student.parentGSTNo ?? "",

      // Work
      Working: student.workStatus ?? "",
      Occupation: student.occupation ?? "",
      OrgName: student.organization ?? "",
      Salary: student.salary != null ? String(student.salary) : "",

      // Other
      Source: student.source != null ? String(student.source) : "",
      Comments: student.comments ?? "",
      remark: student.remarks ?? student.followUpRemarks ?? "",

      // Follow-up
      FollowUpRequired: Boolean(student.enableFollowUp),

      Followup:
        student.followUpStatusId != null
          ? String(student.followUpStatusId)
          : "",

      FollowDate: student.followUpDate ?? "",

      // Education
      EducationQualifications: (student.education ?? []).map((item: any) => ({
        Id: item.id ?? 0,
        Degree: item.degree ?? "",
        Collegename: item.college ?? "",
        Stream: item.stream ?? "",
        Percentage: item.percentage ?? "",
        Year1: item.year ?? "",
        tempId: crypto.randomUUID(),
      })),

      // Existing photo cannot be put directly into a File field
      Image: null,
    };
  };
  const saveCurrentEducation = (): boolean => {
    const data = methods.getValues();

    const fields = {
      Degree: data.Degree?.trim() || "",
      Collegename: data.Collegename?.trim() || "",
      Stream: data.Stream?.trim() || "",
      Percentage: data.Percentage?.trim() || "",
      Year1: data.Year1?.trim() || "",
    };

    const hasData = Object.values(fields).some((value) => value !== "");

    // Nothing entered → Education is optional
    if (!hasData) {
      return true;
    }

    // Clear previous education errors
    methods.clearErrors([
      "Degree",
      "Collegename",
      "Stream",
      "Percentage",
      "Year1",
    ]);

    // --------------------------------------------------
    // Degree is mandatory if user started an education row
    // --------------------------------------------------
    if (!fields.Degree) {
      methods.setError("Degree", {
        type: "manual",
        message: "Degree is required.",
      });

      return false;
    }

    // --------------------------------------------------
    // Validate ONLY fields that have values
    // --------------------------------------------------
    let hasError = false;

    Object.entries(fields).forEach(([field, value]) => {
      // Empty optional fields are allowed
      if (!value) {
        return;
      }

      const schemaField =
        educationQualificationSchema.shape[
          field as keyof typeof educationQualificationSchema.shape
        ];

      const result = schemaField.safeParse(value);

      if (!result.success) {
        hasError = true;

        methods.setError(field as keyof EnquiryFormData, {
          type: "manual",
          message: result.error.issues[0]?.message,
        });
      }
    });

    if (hasError) {
      return false;
    }

    // --------------------------------------------------
    // Create qualification row
    // --------------------------------------------------
    const currentQualifications =
      methods.getValues("EducationQualifications") || [];

    methods.setValue(
      "EducationQualifications",
      [
        ...currentQualifications,
        {
          Id: 0,
          Degree: fields.Degree,
          Collegename: fields.Collegename,
          Stream: fields.Stream,
          Percentage: fields.Percentage,
          Year1: fields.Year1,
          tempId: crypto.randomUUID(),
        },
      ],
      {
        shouldDirty: true,
      },
    );

    // Clear temporary fields
    methods.setValue("Degree", "");
    methods.setValue("Collegename", "");
    methods.setValue("Stream", "");
    methods.setValue("Percentage", "");
    methods.setValue("Year1", "");

    return true;
  };
  /*
   * ============================================================
   * STEP VALIDATION
   * ============================================================
   */

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 0:
        return methods.trigger([
          "EnquiryDate",
          "EnqStatus",
          "Fname",
          "Mname",
          "Lname",
          "Salutation",
          "Gender",
          "PContact",
          "EmailId",
          "DOB",
          "Age",
          "Stud_Category",
          "biometricattendanceid",
          "CorrAddress",
          "countryidc",
          "stateidc",
          "cityidc",
          "othercityc",
          "pincodeC",
          "PermanentAdd",
          "countryid",
          "stateid",
          "cityid",
          "othercity",
          "pincode",
          "Image",
          "FollowUpRequired",
          "Followup",
          "FollowDate",
          "FollowTime",
          "walkIn",
          "walkInDate",
          "remark",
        ]);
      case 1:
        // Academic selections are currently managed by Academic itself.
        return true;

      case 2:
        return methods.trigger([
          "FMobile",
          "MMobile",
          "ParentCompanyName",
          "GSTNumber",
          "Occupation",
          "OrgName",
          "Salary",
        ]);

      case 3:
        return saveCurrentEducation();

      case 4:
        return true;

      default:
        return true;
    }
  };

  /*
   * ============================================================
   * NEXT
   * ============================================================
   */

  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (currentStep === steps.length - 1) {
      return;
    }

    console.log("NEXT CLICKED - currentStep:", currentStep);

    const isValid = await validateCurrentStep();

    console.log("NEXT validation:", isValid);

    if (!isValid) {
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };
  /*
   * ============================================================
   * PREVIOUS
   * ============================================================
   */

  const handlePrevious = () => {
    if (currentStep === 0) {
      return;
    }

    // If user has typed an education row, validate/save it
    if (currentStep === 3) {
      const saved = saveCurrentEducation();

      if (!saved) {
        return;
      }
    }

    setCurrentStep((prev) => prev - 1);
  };

  /*
   * ============================================================
   * STEPPER CLICK
   * ============================================================
   */

  const handleStepChange = async (nextStep: number) => {
    if (nextStep === currentStep) {
      return;
    }

    // Do not allow skipping forward without validating
    if (nextStep > currentStep) {
      const isValid = await validateCurrentStep();

      if (!isValid) {
        return;
      }
    }

    // Save education before leaving Education step
    if (currentStep === 3 && nextStep !== 3) {
      const saved = saveCurrentEducation();

      if (!saved) {
        return;
      }
    }

    setCurrentStep(nextStep);
  };
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (typeof result !== "string") {
          reject(new Error("Failed to convert image to Base64"));
          return;
        }

        // Remove: data:image/jpeg;base64,
        const base64 = result.split(",")[1];

        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read image file"));
      };

      reader.readAsDataURL(file);
    });
  };
  /*
   * ============================================================
   * FINAL PAYLOAD
   * ============================================================
   */
  const buildPayload = async (
    data: EnquiryFormData,
    branchId: number,
  ): Promise<AddEnquiryPayload> => {
    const photo = data.Image ? await fileToBase64(data.Image) : null;

    const finalFollowUpDate =
      data.FollowUpRequired && data.FollowDate && data.FollowTime
        ? `${data.FollowDate.split(" ")[0]} ${data.FollowTime}:00`
        : null;

    return {
      // Registration / Enquiry
      regDate: data.RegDate || null,
      enquiryDate: data.EnquiryDate || "",
      walkInDate: data.walkInDate || null,
      walkIn: data.walkIn ? "1" : "",

      // Personal
      gender: Number(data.Gender) || 0,
      salutation: String(data.Salutation || ""),
      firstName: data.Fname?.trim() || "",
      middleName: data.Mname?.trim() || "",
      lastName: data.Lname?.trim() || "",
      Mobile: data.PContact?.trim() || "",
      email: data.EmailId?.trim() || "",
      biometricAttendanceId: data.biometricattendanceid || "",

      // Academic
      selectedSubjects: data.selectedSubjects || "",
      selectedCourses: data.selectedCourses || "",
      otherFeesIds: data.otherFeesIds || "",
      batchIds: data.batchIds || [],

      // Correspondence address
      address: data.CorrAddress || "",
      countryId: Number(data.countryidc) || 0,
      stateId: Number(data.stateidc) || 0,
      cityId: Number(data.cityidc) || 0,
      otherCity: data.othercityc || "",
      pinCode: data.pincode || "",

      // Permanent address
      permanentAddress: data.PermanentAdd || "",
      countryIdC: Number(data.countryid) || 0,
      stateIdC: Number(data.stateid) || 0,
      cityIdC: Number(data.cityid) || 0,
      otherCityC: data.othercity || "",
      pinCodeC: data.pincodeC || "",

      // Contact
      homePhone: data.HomeNo || "",

      // Personal additional
      dateOfBirth: data.DOB || null,
      age: Number(data.Age) || 0,
      category: data.Stud_Category || "",
      photo,
      // Work
      workStatus: data.Working || "",
      occupation: data.Occupation || "",
      organization: data.OrgName || "",
      salary: Number(data.Salary) || 0,

      // Other
      source: data.Source || "",
      comments: data.Comments || "",

      // Father
      fatherFirstName: data.FatherFName || "",
      fatherMiddleName: data.FatherMName || "",
      fatherLastName: data.FatherLName || "",
      mobile1: data.FMobile || "",

      // Mother
      motherFirstName: data.MotherFName || "",
      motherMiddleName: data.MotherMName || "",
      motherLastName: data.MotherLName || "",
      mobile2: data.MMobile || "",

      // Parent
      parentCompanyName: data.ParentCompanyName || "",
      parentGSTNo: data.GSTNumber || "",

      // Education
      education: (data.EducationQualifications || []).map(
        ({ tempId, Id, Degree, Collegename, Stream, Percentage, Year1 }) => ({
          degree: Degree || "",
          college: Collegename || "",
          stream: Stream || "",
          percentage: Percentage || "",
          year: Year1 || "",
        }),
      ),

      // Follow-up
      enableFollowUp: data.FollowUpRequired,
      followUpStatusId:
        data.FollowUpRequired && data.Followup ? Number(data.Followup) : null,
      followUpRemarks: data.remark || "",
      followUpDate: finalFollowUpDate,

      // Status / Remarks
      isInterested: true,
      remarks: data.remark || "",
      enqStatus: Number(data.EnqStatus) || 0,

      branchId,
    };
  };

  /*
   * ============================================================
   * FINAL SAVE
   * ============================================================
   */
  const handleSubmit: SubmitHandler<EnquiryFormData> = async (data) => {
    console.log("SUBMIT FIRED");
    console.log("FORM DATA:", data);

    try {
      setIsSaving(true);

      const validationResult = enquirySchema.safeParse(data);

      if (!validationResult.success) {
        validationResult.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof EnquiryFormData;

          methods.setError(field, {
            type: "manual",
            message: issue.message,
          });
        });

        return;
      }

      const payload = await buildPayload(validationResult.data, branchId);

      console.log("POST Enquiry payload:", payload);
      const response = await addEnquiry(payload);

      console.log("Enquiry saved successfully:", response);

      // Success toast
      toast.success("Enquiry saved successfully!");

      // Clear validation/global errors
      methods.clearErrors();
      dispatch(clearGlobalError());

      // Redirect to Enquiry List
      navigate("/enquiry/list");
    } catch (error) {
      console.error("Failed to save enquiry:", error);
    } finally {
      setIsSaving(false);
    }
  };
  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <RegistrationPersonal existingPhoto={existingPhoto} />;

      case 1:
        return <Academic />;

      case 2:
        return <FamilyWork />;

      case 3:
        return <Education />;

      case 4:
        return <Remarks />;

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit, (errors) => {
          console.log("FORM VALIDATION ERRORS:", errors);
        })}
      >
        <div className="space-y-6">
          <EnquiryStepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />

          {renderStep()}
          <div>
            <ValidationErrorSummary />
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={currentStep === 0 || isSaving}
                onClick={handlePrevious}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                {/* Send Payment Link */}
                <button
                  type="button"
                  disabled={currentStep === 0 || isSaving}
                  onClick={() => {
                    console.log(
                      isEditMode
                        ? "Update & Send Payment Link clicked"
                        : "Save & Send Payment Link clicked",
                    );
                    // Add payment link API here
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#0F4C81] text-[#0F4C81] text-sm font-semibold hover:bg-[#e0eef5] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isEditMode
                    ? "Update & Send Payment Link"
                    : "Save & Send Payment Link"}
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {isEditMode ? "Update & Next" : "Save & Next"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {isSaving
                      ? isEditMode
                        ? "Updating..."
                        : "Saving..."
                      : isEditMode
                        ? "Update"
                        : "Save"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
