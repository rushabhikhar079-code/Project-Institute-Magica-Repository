// import { z } from "zod";

// export const instituteSchema = z
//   .object({
//     regDate: z
//       .string()
//       .min(1, "Date of Registration is required")
//       .refine(
//         (val) => {
//           if (!val) return false;
//           const selected = new Date(val);
//           const today = new Date();

//           // Reset hours to compare dates only
//           selected.setHours(0, 0, 0, 0);
//           today.setHours(0, 0, 0, 0);

//           return selected <= today;
//         },
//         { message: "Registration date cannot be a future date." },
//       ),
//     instituteShortCode: z
//       .string()
//       .max(15, "Institute Short Code cannot exceed 15 characters.")
//       .regex(
//         /^[a-zA-Z0-9\s.-]+$/,
//         "Institute Short Code cannot contain special characters.",
//       )
//       .or(z.literal(""))
//       .optional(),
//     parentCompanyName: z
//       .string()
//       .max(100, "Parent Company name cannot exceed 100 characters.")
//       .regex(
//         /^[a-zA-Z0-9\s.-]+$/,
//         "Parent Company name cannot contain special characters.",
//       )
//       .or(z.literal(""))
//       .optional(),
//     //   instituteName: z.string().min(1, "Name of Institute is required."),
//     instituteName: z
//       .string()
//       .min(2, "Institute name is required.")
//       .max(50, "Institute name cannot exceed 50 characters.")
//       .regex(
//         /^[a-zA-Z0-9\s.-]+$/,
//         "Institute name cannot contain special characters.",
//       ),
//     //   address: z.string().min(1, "Address is required."),
//     address: z
//       .string()
//       .min(5, "Address must be at least 5 characters.")
//       .max(200, "Address cannot exceed 200 characters.")
//       .regex(
//         /^[a-zA-Z0-9\s,./#-]+$/,
//         "Address contains invalid special characters.",
//       ),
//     countryId: z.preprocess(
//       (val) => (val === "" || val === undefined ? 0 : Number(val)),
//       z.number().min(1, "Country is required."),
//     ),
//     stateId: z.preprocess(
//       (val) => (val === "" || val === undefined ? 0 : Number(val)),
//       z.number().min(1, "State is required."),
//     ),
//     cityId: z.preprocess(
//       (val) => (val === "" || val === undefined ? 0 : Number(val)),
//       z.number().min(1, "City is required."),
//     ),
//     otherCity: z
//       .string()
//       .max(150, "Other City cannot exceed 150 characters.")
//       .regex(
//         /^[a-zA-Z\s.-]*$/,
//         "City name cannot contain special characters or numbers.",
//       )
//       .optional(),
//     //   pinCode: z.string().optional(),
//     pinCode: z
//       .string()
//       .regex(/^[0-9]+$/, "Pincode must contain numbers only.")
//       .min(6, "Pincode must be at least 6 digits.")
//       .max(6, "Pincode cannot exceed 6 digits.")
//       .or(z.literal(""))
//       .optional(),
//     phone: z
//       .string()
//       .regex(/^[0-9]{9,16}$/, "Phone number must be between 9 and 16 digits.")
//       .or(z.literal(""))
//       .optional(),
//     email: z
//       .string()
//       .min(1, "Email ID is required.")
//       .max(45, "Email ID cannot exceed 45 characters.")
//       .email("Please enter a valid Email ID."),
//     //   noOfStudents: z.coerce.number().optional(),
//     noOfStudents: z
//       .union([
//         z.coerce
//           .number()
//           .int()
//           .positive("Must be a valid number greater than 0.")
//           .max(999999, "Number of students cannot exceed 6 digits."),
//         z.literal(""),
//         z.literal(0),
//       ])
//       .optional(),
//     //   instProCoachingFor: z.string().optional(),
//     instProCoachingFor: z
//       .string()
//       .max(100, "Coaching cannot exceed 100 characters.")
//       .regex(
//         /^[a-zA-Z0-9\s,-]+$/,
//         "Only letters, numbers, spaces, commas, and hyphens are allowed.",
//       )
//       .or(z.literal(""))
//       .optional(),
//     remarks: z
//       .string()
//       .trim()
//       // Allows letters, numbers, spaces, newlines (\n, \r), and common punctuation (. , - _)
//       .regex(
//         /^[a-zA-Z0-9\s.,\-_]*$/,
//         "Remarks cannot contain invalid special characters.",
//       )
//       .optional()
//       .or(z.literal("")),
//     salesPersonName: z
//       .string()
//       .max(100, "Sales Person Name cannot exceed 100 characters.")
//       .or(z.literal(""))
//       .optional(),
//     isInternalUse: z.preprocess(
//       (val) => (val === "true" ? true : val === "false" ? false : val),
//       z.boolean().default(false).optional(),
//     ),
//     logo: z.string().optional(),
//     logoPath: z.string().optional(),
//     instituteType: z.preprocess(
//       (val) => (typeof val === "string" ? Number(val) : val),
//       z.number().default(1).optional(),
//     ),
//     instituteStatus: z.preprocess(
//       (val) => (typeof val === "string" ? Number(val) : val),
//       z.number().default(1).optional(),
//     ),
//     instituteExpiryDate: z.string().optional(),
//     isAllowStudModule: z.boolean().default(false),
//     isAllowedAndroidApp: z.boolean().default(false),
//     isAllowTestEngine: z.boolean().default(false),
//     contactPerson: z
//       .string()
//       .min(1, "Contact Person is required.")
//       .max(45, "Contact Person cannot exceed 45 characters.")
//       .regex(
//         /^[a-zA-Z0-9\s.-]+$/,
//         "Contact Person name cannot contain special characters.",
//       ),
//     cpMobile: z
//       .string()
//       .min(1, "Mobile is required.")
//       .max(16, "Mobile cannot exceed 16 digits.")
//       .regex(/^[0-9]{9,16}$/, "Mobile number must be between 9 and 16 digits."),
//     cpEmail: z
//       .string()
//       .min(1, "Contact Person Email ID is required.")
//       .max(45, "Contact Person Email ID cannot exceed 45 characters.")
//       .email("Please enter a valid Contact Person Email ID."),

//     // Conditionally used for Mode = 'edit'
//     subscription: z
//       .object({
//         subscriptionType: z.string().optional(),
//         startDate: z.string().optional(),
//         endDate: z.string().optional(),
//         noOfDays: z.coerce.number().optional(),
//         noOfRegStudents: z.coerce.number().optional(),
//         noOfEnquiry: z.coerce.number().optional(),
//         noOfBranches: z.coerce.number().optional(),
//         institutePlanId: z.coerce.number().optional(),
//       })
//       .superRefine((data, ctx) => {
//         // 1. Mandatory Validations for ALL plans
//         if (!data.startDate || data.startDate.trim() === "") {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             path: ["startDate"],
//             message: "Start Date is required.",
//           });
//         }

//         if (!data.endDate || data.endDate.trim() === "") {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             path: ["endDate"],
//             message: "End Date is required.",
//           });
//         }

//         if (!data.institutePlanId || Number(data.institutePlanId) <= 0) {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             path: ["institutePlanId"],
//             message: "Institute Plan is required.",
//           });
//         }

//         // 2. Branch Wise Selected ("1")
//         if (
//           data.subscriptionType === "1" &&
//           (data.noOfBranches === undefined || data.noOfBranches <= 0)
//         ) {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             path: ["noOfBranches"],
//             message: "No. of Branches is required.",
//           });
//         }

//         // 3. Student Wise Selected ("0")
//         if (data.subscriptionType === "0") {
//           if (data.noOfRegStudents === undefined || data.noOfRegStudents <= 0) {
//             ctx.addIssue({
//               code: z.ZodIssueCode.custom,
//               path: ["noOfRegStudents"],
//               message: "No. of Registered Students is required.",
//             });
//           }
//           if (data.noOfEnquiry === undefined || data.noOfEnquiry <= 0) {
//             ctx.addIssue({
//               code: z.ZodIssueCode.custom,
//               path: ["noOfEnquiry"],
//               message: "No. of Enquiry Students is required.",
//             });
//           }
//         }
//       }),
//   })

//   .superRefine((data, ctx) => {
//     // Converts cityId to Number to handle string/number dropdown mismatches
//     const cityIdNum = Number(data.cityId);

//     // Checks for common "Other" city IDs (e.g., 0, -1, 999, 9999) or if value is 'other'
//     const isOtherSelected =
//       cityIdNum === 999 ||
//       cityIdNum === 0 ||
//       cityIdNum === -1 ||
//       String(data.cityId).toLowerCase() === "other";

//     if (isOtherSelected && (!data.otherCity || data.otherCity.trim() === "")) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Please specify your city.",
//         path: ["otherCity"],
//       });
//     }
//   });

// export type InstituteFormValues = z.infer<typeof instituteSchema>;
import { z } from "zod";

export const instituteSchema = z
  .object({
    regDate: z
      .string()
      .min(1, "Date of Registration is required")
      .refine(
        (val) => {
          if (!val) return false;
          const selected = new Date(val);
          const today = new Date();

          selected.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          return selected <= today;
        },
        { message: "Registration date cannot be a future date." },
      ),
    instituteShortCode: z
      .string()
      .max(15, "Institute Short Code cannot exceed 15 characters.")
      .regex(
        /^[a-zA-Z0-9\s.-]+$/,
        "Institute Short Code cannot contain special characters.",
      )
      .or(z.literal(""))
      .optional(),
    parentCompanyName: z
      .string()
      .max(100, "Parent Company name cannot exceed 100 characters.")
      .regex(
        /^[a-zA-Z0-9\s.-]+$/,
        "Parent Company name cannot contain special characters.",
      )
      .or(z.literal(""))
      .optional(),
    instituteName: z
      .string()
      .min(2, "Institute name is required.")
      .max(50, "Institute name cannot exceed 50 characters.")
      .regex(
        /^[a-zA-Z0-9\s.-]+$/,
        "Institute name cannot contain special characters.",
      ),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters.")
      .max(200, "Address cannot exceed 200 characters.")
      .regex(
        /^[a-zA-Z0-9\s,./#-]+$/,
        "Address contains invalid special characters.",
      ),
    countryId: z.preprocess(
      (val) => (val === "" || val === undefined ? 0 : Number(val)),
      z.number().min(1, "Country is required."),
    ),
    country: z.string().optional(),
    stateId: z.preprocess(
      (val) => (val === "" || val === undefined ? 0 : Number(val)),
      z.number().min(1, "State is required."),
    ),
    state: z.string().optional(),
    cityId: z.preprocess(
      (val) => (val === "" || val === undefined ? 0 : Number(val)),
      z.number().min(1, "City is required."),
    ),
    city: z.string().optional(),
    otherCity: z
      .string()
      .max(150, "Other City cannot exceed 150 characters.")
      .regex(
        /^[a-zA-Z\s.-]*$/,
        "City name cannot contain special characters or numbers.",
      )
      .optional(),

    // FIX 1: Pincode made truly optional
    pinCode: z
      .string()
      .regex(/^[0-9]+$/, "Pincode must contain numbers only.")
      .min(6, "Pincode must be at least 6 digits.")
      .max(6, "Pincode cannot exceed 6 digits.")
      .or(z.literal(""))
      .optional(),

    // FIX 2: Mobile/Phone made truly optional
    phone: z
      .string()
      .regex(/^[0-9]{9,16}$/, "Phone number must be between 9 and 16 digits.")
      .or(z.literal(""))
      .optional(),

    email: z
      .string()
      .min(1, "Email ID is required.")
      .max(45, "Email ID cannot exceed 45 characters.")
      .email("Please enter a valid Email ID."),

    noOfStudents: z
      .union([
        z.coerce
          .number()
          .int()
          .positive("Must be a valid number greater than 0.")
          .max(999999, "Number of students cannot exceed 6 digits."),
        z.literal(""),
        z.literal(0),
      ])
      .optional(),

    // FIX 3: Coaching made truly optional
    instProCoachingFor: z
      .string()
      .max(100, "Coaching cannot exceed 100 characters.")
      .regex(
        /^[a-zA-Z0-9\s,-]*$/,
        "Only letters, numbers, spaces, commas, and hyphens are allowed.",
      )
      .or(z.literal(""))
      .optional(),

    remarks: z
      .string()
      .trim()
      .regex(
        /^[a-zA-Z0-9\s.,\-_]*$/,
        "Remarks cannot contain invalid special characters.",
      )
      .or(z.literal(""))
      .optional(),

    salesPersonName: z
      .string()
      .max(100, "Sales Person Name cannot exceed 100 characters.")
      .or(z.literal(""))
      .optional(),

    isInternalUse: z.preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.boolean().default(false).optional(),
    ),
    logo: z.string().optional(),
    logoPath: z.string().optional(),
    instituteType: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().default(1).optional(),
    ),
    instituteStatus: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().default(1).optional(),
    ),
    instituteExpiryDate: z.string().optional(),
    isAllowStudModule: z.boolean().default(false),
    isAllowedAndroidApp: z.boolean().default(false),
    isAllowTestEngine: z.boolean().default(false),

    contactPerson: z
      .string()
      .min(1, "Contact Person is required.")
      .max(45, "Contact Person cannot exceed 45 characters.")
      .regex(
        /^[a-zA-Z0-9\s.-]+$/,
        "Contact Person name cannot contain special characters.",
      ),
    cpMobile: z
      .string()
      .min(1, "Mobile is required.")
      .max(16, "Mobile cannot exceed 16 digits.")
      .regex(/^[0-9]{9,16}$/, "Mobile number must be between 9 and 16 digits."),
    cpEmail: z
      .string()
      .min(1, "Contact Person Email ID is required.")
      .max(45, "Contact Person Email ID cannot exceed 45 characters.")
      .email("Please enter a valid Contact Person Email ID."),
    institutePlanId: z.coerce
      .number({ message: "Please select an institute plan" })
      .gt(0, "Please select a valid institute plan"),
    // FIX 4: Defaulting object allows inner refinements to execute on submit
    subscription: z
      .object({
        subscriptionType: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        noOfDays: z.coerce.number().optional(),
        noOfRegStudents: z.coerce.number().optional(),
        noOfEnquiry: z.coerce.number().optional(),
        noOfBranches: z.coerce.number().optional(),

        planStatus: z.coerce.number().optional(),
      })
      .optional()
      .nullable()
      .superRefine((data, ctx) => {
        if (!data) return;
        const hasAnyPlanSelected =
          Boolean(data.startDate) || Boolean(data.endDate); //||
        // Number(data.institutePlanId || 0) > 0;
        if (!hasAnyPlanSelected) return;
        // 1. Mandatory Validations for ALL plans
        if (!data.startDate || data.startDate.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startDate"],
            message: "Start Date is required.",
          });
        }

        if (!data.endDate || data.endDate.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: "End Date is required.",
          });
        }

        // if (!data.institutePlanId || Number(data.institutePlanId) <= 0) {
        //   ctx.addIssue({
        //     code: z.ZodIssueCode.custom,
        //     path: ["institutePlanId"],
        //     message: "Institute Plan is required.",
        //   });
        // }

        // 2. Branch Wise Selected ("1")
        if (
          data.subscriptionType === "1" &&
          (data.noOfBranches === undefined ||
            data.noOfBranches === null ||
            data.noOfBranches <= 0)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["noOfBranches"],
            message: "No. of Branches is required.",
          });
        }

        // 3. Student Wise Selected ("0")
        if (data.subscriptionType === "0") {
          if (data.noOfRegStudents === undefined || data.noOfRegStudents <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["noOfRegStudents"],
              message: "No. of Registered Students is required.",
            });
          }
          if (data.noOfEnquiry === undefined || data.noOfEnquiry <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["noOfEnquiry"],
              message: "No. of Enquiry Students is required.",
            });
          }
        }
      }),
  })
  .superRefine((data, ctx) => {
    const cityIdNum = Number(data.cityId);
    const isOtherSelected =
      cityIdNum === 999 ||
      cityIdNum === 0 ||
      cityIdNum === -1 ||
      String(data.cityId).toLowerCase() === "other";

    if (isOtherSelected && (!data.otherCity || data.otherCity.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your city.",
        path: ["otherCity"],
      });
    }
  });

export type InstituteFormValues = z.infer<typeof instituteSchema>;
