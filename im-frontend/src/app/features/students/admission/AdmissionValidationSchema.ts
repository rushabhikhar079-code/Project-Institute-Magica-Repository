import { z } from "zod";
const optionalString = z.string().trim().optional().or(z.literal(""));
// export const registrationPersonalSchema = z.object({
//   // Registration
//   regDate: z.string().min(1, "Registration date is required"),
//   regNo: z
//     .string()
//     .trim()
//     .min(1, "Registration number is required")
//     .max(50, "Registration number cannot exceed 50 characters"),
//   rollNo: optionalString,
//   status: z.number(),
//   // Personal
//   gender: z.number().min(1, "Gender is required"),
//   salutation: optionalString,
//   firstName: z
//     .string()
//     .trim()
//     .min(1, "First name is required")
//     .max(100, "First name cannot exceed 100 characters"),
//   middleName: optionalString,
//   lastName: optionalString,
//   mobile: z
//     .string()
//     .trim()
//     .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
//   email: z.string().trim().email("Enter a valid email address"),
//   biometricAttendanceId: optionalString,
//   dateOfBirth: optionalString,
//   category: optionalString,
//   Image: z.instanceof(File).nullable().optional(),
//   age: optionalString,
//   // Correspondence Address
//   address: optionalString,
//   countryIdC: z.number(),
//   stateIdC: z.number(),
//   cityIdC: z.number(),
//   pinCodeC: optionalString,
//   // Permanent Address
//   sameAsAddress: z.boolean(),
//   permanentAddress: optionalString,
//   countryId: z.number(),
//   stateId: z.number(),
//   cityId: z.number(),
//   pinCode: optionalString,
//   country: optionalString,
//   state: optionalString,
//   city: optionalString,
//   countryC: optionalString,
//   stateC: optionalString,
//   cityC: optionalString,
// });
export const registrationPersonalSchema = z.object({
  // Registration
  regDate: z.string().min(1, "Registration date is required"),

  regNo: z.string().trim().min(1, "Registration number is required"),

  rollNo: z.string(),

  status: z.number(),

  // Personal
  gender: z.number().min(1, "Gender is required"),

  salutation: z.string(),

  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .regex(/^[A-Za-z\s'-]+$/, "First name can contain only alphabets"),

  middleName: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]*$/, "Middle name can contain only alphabets"),

  lastName: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]*$/, "Last name can contain only alphabets"),

  mobile: z
    .string()
    .min(1, "Contact Number is required")
    .refine(
      (value) => value === "" || /^\d{10,15}$/.test(value),
      "Enter a valid mobile number (10-15 digits)",
    ),

  email: z.string().trim().email("Enter a valid email address"),

  biometricAttendanceId: z
    .string()
    .refine(
      (value) => value === "" || /^\d{2,45}$/.test(value),
      "Enter a valid biometric id.",
    ),

  dateOfBirth: z.string(),

  age: z.string(),

  category: z.string(),

  Image: z.instanceof(File).nullable(),

  // Address
  address: z.string().trim().max(200, "Address cannot exceed 200 characters"),

  countryId: z.number(),
  stateId: z.number(),
  cityId: z.number(),

  pinCode: z
    .string()
    .refine(
      (value) => value === "" || /^\d{6}$/.test(value),
      "PIN code must be exactly 6 digits",
    ),

  sameAsAddress: z.boolean(),

  permanentAddress: z
    .string()
    .trim()
    .max(200, "Permanent address cannot exceed 200 characters"),
  otherCity: z.string(),
  countryIdC: z.number(),
  stateIdC: z.number(),
  cityIdC: z.number(),

  pinCodeC: z
    .string()
    .refine(
      (value) => value === "" || /^\d{6}$/.test(value),
      "PIN code must be exactly 6 digits",
    ),

  country: z.string(),
  state: z.string(),
  city: z.string(),

  countryC: z.string(),
  stateC: z.string(),
  cityC: z.string(),
  otherCityC: z.string(),
});
//Academic
// export const academicSchema = z.object({
//   selectedCourses: z
//     .array(z.number())
//     .min(1, "Please select at least one course"),

//   selectedSubjects: z
//     .array(z.number())
//     .min(1, "Please select at least one subject"),

//   batchIds: z.array(z.number()),
//   otherFeesIds: z.array(z.number()),
//   selectedSubjectsPayload: z.string(),
// });
export const academicSchema = z.object({
  selectedCourses: z
    .array(z.number())
    .min(1, "Please select at least one course"),

  selectedSubjects: z
    .array(z.number())
    .min(1, "Please select at least one subject"),

  batchIds: z.array(z.number()),

  otherFeesIds: z.array(z.number()),

  selectedSubjectsPayload: z.string(),
});
//Family
export const familyWorkSchema = z.object({
  //   fatherFirstName: z.string().trim().min(1, "Father's first name is required"),
  fatherFirstName: z
    .string()
    .refine(
      (value) => value === "" || /^[A-Za-z\s'-]+$/.test(value),
      "Father's first name can contain only alphabets",
    ),
  //   fatherFirstName: z.string().trim(),

  fatherMiddleName: z
    .string()
    .refine(
      (value) => value === "" || /^[A-Za-z\s'-]+$/.test(value),
      "Father's middle name can contain only alphabets",
    ),

  fatherLastName: z
    .string()
    .refine(
      (value) => value === "" || /^[A-Za-z\s'-]+$/.test(value),
      "Father's last name can contain only alphabets",
    ),

  motherFirstName: z
    .string()
    .refine(
      (value) => value === "" || /^[A-Za-z\s'-]+$/.test(value),
      "Mother's first name can contain only alphabets",
    ),

  motherMiddleName: z
    .string()
    .refine(
      (value) => value === "" || /^[A-Za-z\s'-]+$/.test(value),
      "Mother's middle name can contain only alphabets",
    ),

  motherLastName: z
    .string()
    .refine(
      (value) => value === "" || /^[A-Za-z\s'-]+$/.test(value),
      "Mother's last name can contain only alphabets",
    ),

  mobile1: z
    .string()
    .refine(
      (value) => value === "" || /^\d{10,15}$/.test(value),
      "Enter a valid mobile number (10-15 digits)",
    ),

  mobile2: z
    .string()
    .refine(
      (value) => value === "" || /^\d{10,15}$/.test(value),
      "Enter a valid mobile number (10-15 digits)",
    ),

  parentCompanyName: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s'-]*$/, "Parent company name can contain only alphabets"),

  parentGSTNo: z.string(),

  workStatus: z.string(),

  occupation: z
    .string()
    .refine(
      (value) => value === "" || /^[A-Za-z\s'-]+$/.test(value),
      "Occupation can contain only alphabets",
    ),

  organization: z
    .string()
    .refine(
      (value) => value === "" || /^[A-Za-z\s'-]+$/.test(value),
      "Organization can contain only alphabets",
    ),

  salary: z.string(),
});

// export const familyWorkSchema = z.object({
//   fatherFirstName: z
//     .string()
//     .trim()
//     .min(1, "Father's first name is required")
//     .max(100, "Father's first name cannot exceed 100 characters"),

//   fatherMiddleName: optionalString,

//   fatherLastName: optionalString,

//   mobile1: z
//     .string()
//     .trim()
//     .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
//     .optional()
//     .or(z.literal("")),

//   motherFirstName: z
//     .string()
//     .trim()
//     .min(1, "Mother's first name is required")
//     .max(100, "Mother's first name cannot exceed 100 characters"),

//   motherMiddleName: optionalString,

//   motherLastName: optionalString,

//   mobile2: z
//     .string()
//     .trim()
//     .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
//     .optional()
//     .or(z.literal("")),

//   parentCompanyName: optionalString,

//   parentGSTNo: optionalString,

//   workStatus: z.enum(["Yes", "No"]),

//   occupation: optionalString,

//   organization: optionalString,

//   salary: optionalString,
// });
//Education Details
const educationItemSchema = z.object({
  qualification: z.string(),
  school: z.string(),
  stream: z.string(),
  percentage: z.string(),
  year: z.string(),
});

export const educationSchema = z.object({
  education: z.array(educationItemSchema),
});
//Remarks
export const remarksSchema = z.object({
  source: z.string(),
  comments: z.string(),
  remarks: z.string(),
});
export const admissionValidationSchema = registrationPersonalSchema
  .merge(academicSchema)
  .merge(familyWorkSchema)
  .merge(educationSchema)
  .merge(remarksSchema)
  .superRefine((data, ctx) => {
    // -----------------------------------------
    // CORRESPONDENCE ADDRESS
    // -----------------------------------------
    if (
      data.cityC?.trim().toLowerCase() === "other" &&
      !data.otherCityC?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherCityC"],
        message: "Please specify city.",
      });
    }

    // -----------------------------------------
    // PERMANENT ADDRESS
    // -----------------------------------------
    // Only validate permanent city when:
    // 1. Permanent address is NOT same as correspondence
    // 2. Permanent city is Other
    if (
      !data.sameAsAddress &&
      data.city?.trim().toLowerCase() === "other" &&
      !data.otherCity?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherCity"],
        message: "Please specify city.",
      });
    }
  });

export type AdmissionFormValues = z.infer<typeof admissionValidationSchema>;
