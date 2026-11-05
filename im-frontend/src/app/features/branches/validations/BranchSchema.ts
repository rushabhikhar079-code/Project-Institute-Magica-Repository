import z, { superRefine } from "zod";

const optionalPercentage = (fieldName: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        value === undefined || value === "" || /^\d+(\.\d{1,2})?$/.test(value),
      `${fieldName} must be a valid percentage`,
    )
    .refine((value) => {
      if (value === undefined || value === "") return true;

      const percentage = Number(value);

      return percentage >= 0 && percentage <= 100;
    }, `${fieldName} must be between 0 and 100`);
const MAX_AGREEMENT_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_AGREEMENT_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const agreementFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_AGREEMENT_FILE_SIZE, {
    message: "Agreement file must not exceed 10 MB",
  })
  .refine((file) => ALLOWED_AGREEMENT_FILE_TYPES.includes(file.type), {
    message: "Only PDF, JPG, and PNG files are allowed",
  })
  .optional()
  .nullable();
const optionalAmount = (fieldName: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        value === undefined || value === "" || /^\d+(\.\d{1,2})?$/.test(value),
      `${fieldName} must be a valid amount`,
    )
    .refine((value) => {
      if (value === undefined || value === "") return true;

      const amount = Number(value);

      return amount >= 0 && amount <= 10000000;
    }, `${fieldName} must be between 0 and 10,000,000`);
export const branchSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Branch name must be at least 2 characters")
      .max(100, "Branch name must not exceed 100 characters"),

    code: z
      .string()
      .trim()
      .max(30, "Branch code must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]*$/,
        "Branch code can contain only letters, numbers, _ and -",
      )
      .optional(),

    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .max(250, "Address must not exceed 250 characters"),

    country: z.string().trim().min(1, "Country is required"),

    countryId: z.number().int().positive("Country is required"),

    state: z.string().trim().min(1, "State is required"),

    stateId: z.number().int().positive("State is required"),

    city: z.string().trim().min(1, "City is required"),

    cityId: z.number().int().min(0),
    pinCode: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          value === undefined || value === "" || /^[0-9]{5,10}$/.test(value),
        "Enter a valid PIN code",
      ),

    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          value === undefined || value === "" || /^[0-9]{10,15}$/.test(value),
        "Enter a valid phone number",
      ),

    agreementFile: agreementFileSchema,

    agreementFileName: z
      .string()
      .trim()
      .max(255, "File name must not exceed 255 characters")
      .optional(),

    agreementFileChanged: z.boolean().optional(),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(150, "Email must not exceed 150 characters")
      .email("Invalid email address"),

    taxRate: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          value === undefined ||
          value === "" ||
          /^(100|[0-9]{1,2})(\.\d{1,2})?$/.test(value),
        "Tax rate must be between 0 and 100",
      ),

    makeFranchisee: z.number().int().min(0).max(1),

    status: z.enum(["Active", "Inactive"]),

    contactName: z
      .string()
      .trim()
      .min(2, "Contact person name must be at least 2 characters")
      .max(100, "Contact person name must not exceed 100 characters")
      .regex(
        /^[a-zA-Z\s.'-]+$/,
        "Contact person name contains invalid characters",
      ),

    contactMobile: z
      .string()
      .trim()
      .min(10, "Mobile number must be at least 10 digits")
      .max(15, "Mobile number must not exceed 15 digits")
      .regex(/^[0-9]+$/, "Mobile number must contain only numbers"),

    contactEmail: z
      .string()
      .trim()
      .min(1, "Contact email is required")
      .max(150, "Contact email must not exceed 150 characters")
      .email("Invalid contact email"),

    // Signup date - cannot be a future date
    signUpDate: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          value === undefined ||
          value === "" ||
          !Number.isNaN(Date.parse(value)),
        "Enter a valid signup date",
      )
      .refine((value) => {
        if (!value) return true;

        const selectedDate = new Date(`${value}T00:00:00`);
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return selectedDate <= today;
      }, "Signup date cannot be a future date"),

    signUpAmount: optionalAmount("Signup amount"),

    monthlyFee: optionalAmount("Monthly fee"),

    testFee: optionalAmount("Test fee"),

    certFee: optionalAmount("Certification fee"),

    feeCommission: optionalPercentage("Fee commission"),

    fixedStudentFee: optionalAmount("Fixed student fee"),

    otherCity: z
      .string()
      .trim()
      .max(100, "City name must not exceed 100 characters")
      .regex(/^[a-zA-Z\s.'-]*$/, "City name contains invalid characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.makeFranchisee === 1 && !data.signUpDate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["signUpDate"],
        message: "Signup date is required for a franchise",
      });
    }
    // No city selected from DB → Other City is required
    if (data.cityId === 0 && !data.otherCity?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherCity"],
        message: "City name is required",
      });
    }

    if (data.makeFranchisee === 1) {
      // Signup date required
      if (!data.signUpDate?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["signUpDate"],
          message: "Signup date is required for a franchise",
        });
      }

      // Franchisee amount fields
      const requiredAmountFields = [
        ["signUpAmount", "Signup amount"],
        ["monthlyFee", "Monthly fee"],
        ["testFee", "Test fee"],
        ["certFee", "Certification fee"],
        ["fixedStudentFee", "Fixed student fee"],
      ] as const;

      // for (const [field, label] of requiredAmountFields) {
      //   if (!data[field]?.trim()) {
      //     ctx.addIssue({
      //       code: z.ZodIssueCode.custom,
      //       path: [field],
      //       message: `${label} is required for a franchise`,
      //     });
      //   }
      // }

      // // Commission required
      // if (!data.feeCommission?.trim()) {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     path: ["feeCommission"],
      //     message: "Fee commission is required for a franchise",
      //   });
      // }
    }
  });

export type BranchFormValidation = z.infer<typeof branchSchema>;
