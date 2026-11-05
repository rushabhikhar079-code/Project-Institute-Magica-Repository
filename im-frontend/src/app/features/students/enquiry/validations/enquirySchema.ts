import { z } from "zod";
export const educationQualificationSchema = z.object({
  Degree: z
    .string()
    .trim()
    .min(1, "Degree is required")
    .max(100, "Degree cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s.&'-]+$/, "Degree contains invalid characters"),

  Collegename: z
    .string()
    .trim()
    .min(1, "College name is required")
    .max(150, "College name cannot exceed 150 characters")
    .regex(
      /^[a-zA-Z0-9\s.&'()-]+$/,
      "College name contains invalid characters",
    ),

  Stream: z
    .string()
    .trim()
    .min(1, "Stream is required")
    .max(100, "Stream cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s.&'/-]+$/, "Stream contains invalid characters"),

  Percentage: z
    .string()
    .trim()
    .min(1, "Percentage is required")
    .regex(/^(100|[0-9]{1,2})(\.[0-9]{1,2})?$/, "Enter a valid percentage")
    .refine(
      (value) => Number(value) >= 0 && Number(value) <= 100,
      "Percentage must be between 0 and 100",
    ),

  Year1: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Year must be 4 digits")
    .refine((value) => Number(value) >= 1900, "Year cannot be before 1900")
    .refine(
      (value) => Number(value) <= new Date().getFullYear(),
      `Year cannot be greater than ${new Date().getFullYear()}`,
    ),
});
export const enquirySchema = z
  .object({
    // Registration / Enquiry
    EnquiryDate: z
      .string()
      .min(1, "Enquiry date is required")
      .refine(
        (value) => {
          const today = new Date();

          const todayString = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
          ].join("-");

          return value <= todayString;
        },
        {
          message: "Enquiry date cannot be a future date",
        },
      ),
    RegNo_Manual: z.string().optional(),

    RegDate: z.string().optional(),

    EnqStatus: z.union([z.number(), z.string()]),

    Source: z.string().optional(),

    Registered: z.string().optional(),

    ActiveStatus: z.string().optional(),

    StatusFlag: z.number().optional(),

    // Follow-up
    // Follow-up
    FollowUpRequired: z.boolean(),
    Followup: z.union([z.string(), z.number()]).optional(),
    FollowupReminder: z.number().optional(),
    FollowDate: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;

          const dateOnly = value.split(" ")[0];

          const today = new Date();
          const todayString = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
          ].join("-");

          return dateOnly >= todayString;
        },
        {
          message: "Follow-up date cannot be a previous date",
        },
      ),
    FollowTime: z.string().optional(),
    walkIn: z.boolean(),
    walkInDate: z
      .string()
      .optional()
      .refine(
        (date) => !date || new Date(date) <= new Date(),
        "Walk-in date cannot be a future date",
      ),
    // Remarks
    remark: z.string().optional(),

    newremarks: z.string().optional(),

    // Personal
    Image: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || file.size <= 10 * 1024 * 1024,
        "Image size must be less than 10 MB",
      )
      .refine(
        (file) =>
          !file || ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
        "Only JPG, JPEG, and PNG images are allowed",
      ),
    Fname: z.string().trim().min(1, "First name is required"),
    Mname: z.string().optional(),

    Lname: z.string().optional(),

    Salutation: z.union([z.number(), z.string()]).optional(),

    Gender: z
      .union([z.number(), z.string()])
      .refine((value) => value !== "" && value !== 0, "Gender is required"),

    DOB: z
      .string()
      .optional()
      .refine(
        (date) => !date || new Date(date) <= new Date(),
        "Date of birth cannot be a future date",
      ),

    Age: z.union([z.number(), z.string()]).optional(),

    Stud_Category: z.string().optional(),

    biometricattendanceid: z.string().optional(),

    // Contact
    // Contact
    PContact: z
      .string()
      .regex(/^\d{10,15}$/, "Contact number must be between 10 and 15 digits"),
    FMobile: z
      .string()
      .regex(/^\d{10,15}$/, "Father's mobile must be between 10 and 15 digits")
      .or(z.literal(""))
      .optional(),

    MMobile: z
      .string()
      .regex(/^\d{10,15}$/, "Mother's mobile must be between 10 and 15 digits")
      .or(z.literal(""))
      .optional(),

    HomeNo: z.string().optional(),
    // Academic
    selectedSubjects: z.string().optional(),
    selectedCourses: z.string().optional(),
    otherFeesIds: z.string().optional(),
    batchIds: z.array(z.number()).optional(),
    selectedCourseSubjects: z
      .record(z.string(), z.array(z.number()))
      .optional(),
    selectedBatchIds: z.array(z.number()).optional(),
    EmailId: z
      .string()
      .email("Please enter a valid email address")
      .or(z.literal(""))
      .optional(),

    // Correspondence
    CorrAddress: z.string().optional(),
    countryC: z.string().optional(),
    country: z.string().optional(),
    countryidc: z.union([z.number(), z.string()]).optional(),

    stateidc: z.union([z.number(), z.string()]).optional(),

    cityidc: z.union([z.number(), z.string()]).optional(),

    othercityc: z.string().optional(),

    state: z.string().optional(),

    city: z.string().optional(),

    District: z.string().optional(),

    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pin code must be 6 digits")
      .or(z.literal(""))
      .optional(),

    // Permanent
    PermanentAdd: z.string().optional(),

    countryid: z.union([z.number(), z.string()]).optional(),

    stateid: z.union([z.number(), z.string()]).optional(),

    cityid: z.union([z.number(), z.string()]).optional(),

    othercity: z.string().optional(),

    stateC: z.string().optional(),

    cityC: z.string().optional(),

    DistrictC: z.string().optional(),

    pincodeC: z
      .string()
      .regex(/^\d{6}$/, "Pin code must be 6 digits")
      .or(z.literal(""))
      .optional(),

    // Family
    FatherFName: z
      .string()
      .trim()
      .max(45, "Father's first name cannot exceed 45 characters")
      .regex(
        /^[a-zA-Z\s.'-]*$/,
        "Father first name contains invalid characters",
      )
      .optional(),

    FatherMName: z
      .string()
      .trim()
      .max(45, "Father's middle name cannot exceed 45 characters")
      .regex(
        /^[a-zA-Z\s.'-]*$/,
        "Father middle name contains invalid characters",
      )
      .optional(),

    FatherLName: z
      .string()
      .trim()
      .max(45, "Father's last name cannot exceed 45 characters")
      .regex(/^[a-zA-Z\s.'-]*$/, "Father last name contains invalid characters")
      .optional(),

    MotherFName: z
      .string()
      .trim()
      .max(45, "Mother's first name cannot exceed 45 characters")
      .regex(
        /^[a-zA-Z\s.'-]*$/,
        "Mother first name contains invalid characters",
      )
      .optional(),

    MotherMName: z
      .string()
      .trim()
      .max(45, "Mother's middle name cannot exceed 45 characters")
      .regex(
        /^[a-zA-Z\s.'-]*$/,
        "Mother middle name contains invalid characters",
      )
      .optional(),

    MotherLName: z
      .string()
      .trim()
      .max(45, "Mother's last name cannot exceed 45 characters")
      .regex(/^[a-zA-Z\s.'-]*$/, "Mother last name contains invalid characters")
      .optional(),

    ParentCompanyName: z
      .string()
      .trim()
      .max(100, "Parent's company name cannot exceed 100 characters")
      .regex(
        /^[a-zA-Z0-9\s.&'()-]*$/,
        "Parent's company name contains invalid characters",
      )
      .optional(),

    GSTNumber: z
      .string()
      .trim()
      .max(15, "GST number cannot exceed 15 characters")
      .regex(
        /^[a-zA-Z0-9]*$/,
        "GST number can contain only letters and numbers",
      )
      .optional(),

    // Work
    Working: z.string().optional(),

    Occupation: z
      .string()
      .trim()
      .max(100, "Occupation cannot exceed 100 characters")
      .regex(/^[a-zA-Z\s.&'-]*$/, "Occupation contains invalid characters")
      .optional(),

    OrgName: z
      .string()
      .trim()
      .max(150, "Organization name cannot exceed 150 characters")
      .regex(
        /^[a-zA-Z0-9\s.&'()-]*$/,
        "Organization name contains invalid characters",
      )
      .optional(),

    Salary: z
      .string()
      .trim()
      .regex(/^\d*$/, "Salary must contain only numbers")
      .optional(),

    // Other
    Comments: z
      .string()
      .trim()
      .max(200, "Comments cannot exceed 200 characters")
      .optional(),

    ValidUpto: z.string().optional(),

    Username: z.string().optional(),

    Password: z.string().optional(),

    InactiveStatus: z.string().optional(),

    AttendanceID: z.string().optional(),

    userid: z.union([z.number(), z.string()]).optional(),

    Rollno: z.union([z.number(), z.string()]).optional(),

    Degree: z.string().optional(),

    Collegename: z.string().optional(),

    Stream: z.string().optional(),

    Percentage: z.string().optional(),

    Year1: z.string().optional(),
    // Education
    EducationQualifications: z.array(
      z.object({
        Id: z.number(),
        Degree: z.string(),
        Collegename: z.string(),
        Stream: z.string(),
        Percentage: z.string(),
        Year1: z.string(),
        tempId: z.string(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.walkIn) {
      // Required when Walk In is checked
      if (!data.walkInDate?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["walkInDate"],
          message: "Walk In Date is required",
        });
        return;
      }

      // Cannot be a future date
      const today = new Date();
      const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      if (data.walkInDate > todayString) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["walkInDate"],
          message: "Walk In Date cannot be a future date",
        });
      }
    }
    if (
      data.FollowUpRequired &&
      (data.Followup === undefined ||
        data.Followup === null ||
        String(data.Followup).trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["Followup"],
        message: "Followup is required",
      });
    }
    if (data.FollowUpRequired && data.FollowupReminder === 1) {
      if (!data.FollowDate?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["FollowDate"],
          message: "Follow-up date is required",
        });
      }

      if (!data.FollowTime?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["FollowTime"],
          message: "Follow-up time is required",
        });
      }
    }
  });

export type EnquiryFormData = z.infer<typeof enquirySchema>;
