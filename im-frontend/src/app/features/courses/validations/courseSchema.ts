import { z } from "zod";

export const courseSchema = z
  .object({
    // Always required
    courseClassName: z
      .string()
      .trim()
      .min(1, "Course/Class Name is required")
      .max(255, "Course/Class Name must not exceed 255 characters"),

    // Everything else optional initially
    curriculumId: z.number().optional(),

    description: z
      .string()
      .trim()
      .max(200, "Description must not exceed 200 characters")
      .optional(),

    courseType: z
      .string()
      .trim()
      .max(100, "Course Type must not exceed 100 characters")
      .optional(),

    hsncode: z
      .string()
      .trim()
      .max(50, "HSN/SAC Code must not exceed 50 characters")
      .optional(),

    duration: z.string().optional(),

    durationUnit: z
      .enum(["Year", "Months", "Days", "Hours", "Session"])
      .optional(),

    // Staff
    showAllStaff: z.boolean().optional(),
    selectedStaffIds: z.array(z.number()),
    courseLevelFees: z.boolean(),

    feeType: z.enum(["Full Course Fee", "Session Wise Fee"]).optional(),
    type: z
      .string()
      .trim()
      .max(50, "type should not exceed 50 characters")
      .optional(),
    adhocInstallment: z.boolean().optional(),

    courseFee: z
      .string()
      .optional()
      .refine(
        (value) =>
          value === undefined ||
          value === "" ||
          (!isNaN(Number(value)) && Number(value) >= 0),
        "Enter a valid Course/Class Fee",
      ),

    isTaxable: z.boolean().optional(),

    includingTax: z.boolean().optional(),

    installmentAllowed: z.boolean().optional(),

    maxInstallments: z.string().optional(),

    // Template
    createTemplate: z.boolean().optional(),

    templateStatus: z.enum(["Active", "Inactive"]).optional(),

    intervalOption: z.enum(["Fixed", "Monthly", "Quarterly"]).optional(),

    fixedDays: z.string().optional(),

    monthlyDueDate: z.string().optional(),

    quarterlyDueDate: z.string().optional(),
    status: z.enum(["Active", "Inactive"]),
    installments: z
      .array(
        z.object({
          intervalDays: z.number().min(0),
          amount: z
            .string()
            .min(1, "Amount is required")
            .refine(
              (value) => !isNaN(Number(value)) && Number(value) >= 0,
              "Enter a valid amount",
            ),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // If Course/Class Level Fee is checked,
    // then validate the fee-related fields
    if (data.courseLevelFees) {
      if (!data.courseFee || data.courseFee.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["courseFee"],
          message: "Course/Class Fee is required",
        });
      }

      if (!data.feeType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["feeType"],
          message: "Fee Type is required",
        });
      }
      if (
        data.duration !== null &&
        data.duration !== undefined &&
        Number(data.duration) < 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["duration"],
          message: "Duration can only be positive integer",
        });
      }

      if (!data.durationUnit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["durationUnit"],
          message: "Duration Unit is required",
        });
      }
    }
  });

export type CourseFormValidation = z.infer<typeof courseSchema>;
