import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(15, "Username cannot exceed 15 characters.")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Username can only contain letters and numbers.",
      ),

    instituteName: z
      .string()
      .min(2, "Institute name is required.")
      .max(50, "Institute name cannot exceed 50 characters.")
      .regex(
        /^[a-zA-Z0-9\s.-]+$/,
        "Institute name cannot contain special characters.",
      ),

    email: z.string().email("Please enter a valid email address."),

    mobileNumber: z
      .string()
      .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits."),

    address: z
      .string()
      .min(5, "Address must be at least 5 characters.")
      .regex(
        /^[a-zA-Z0-9\s,./#-]+$/,
        "Address contains invalid special characters.",
      ),
    country: z.string().optional(),
    // countryId: z.number().optional(),
    state: z.string().optional(),
    // stateId: z.number().optional(),
    city: z.string().optional(),
    // cityId: z.number().optional(),
    countryId: z.number().min(1, "Country is required."),
    stateId: z.number().min(1, "State is required."),
    cityId: z.number().min(1, "City is required."),
    // customCity: z.string().optional(),
    pincode: z
      .string()
      .regex(/^[0-9]+$/, "Pincode must contain numbers only.")
      .min(6, "Pincode must be at least 6 digits.")
      .max(6, "Pincode cannot exceed 6 digits."),
    contactPerson: z
      .string()
      .min(2, "Contact person name is required.")
      .max(100, "Contact person name cannot exceed 100 characters.")
      .regex(
        /^[a-zA-Z\s.-]+$/,
        "Contact person name can only contain letters, spaces, and hyphens.",
      ),

    numberOfStudents: z
      .string()
      .regex(/^[0-9]+$/, "Number of students must contain numbers only.")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Must be a valid number greater than 0.",
      })
      .max(6, "Number of students cannot exceed 6 digits."),

    coachingFor: z
      .string()
      .min(2, "Coaching requirement is required.")
      .regex(
        /^[a-zA-Z0-9\s,-]+$/,
        "Only letters, numbers, spaces, commas, and hyphens are allowed.",
      ),
    remarks: z
      .string()
      .trim()
      // Allows letters, numbers, spaces, newlines (\n, \r), and common punctuation (. , - _)
      .regex(
        /^[a-zA-Z0-9\s.,\-_]*$/,
        "Remarks cannot contain invalid special characters.",
      )
      .optional()
      .or(z.literal("")),
    captchaInput: z.string().min(1, "Captcha is required."),
    otherCity: z
      .string()
      .regex(
        /^[a-zA-Z\s.-]*$/,
        "City name cannot contain special characters or numbers.",
      )
      .optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .superRefine((data, ctx) => {
    const isOther = data.city?.trim().toLowerCase() === "other";
    const hasCustomCity = Boolean(
      data.otherCity && data.otherCity.trim().length > 0,
    );

    // If "Other" is selected but otherCity is empty, trigger error
    if (isOther && !hasCustomCity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your city name.",
        path: ["otherCity"],
      });
    }
  });

// Infer TypeScript type automatically from schema
export type RegisterFormData = z.infer<typeof registerSchema>;
