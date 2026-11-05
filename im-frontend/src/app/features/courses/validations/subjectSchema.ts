import z from "zod";

export const installmentSchema = z.object({
  srNo: z.number(),

  intervalDays: z
    .number({
      message: "Interval is required",
    })
    .min(0, "Interval cannot be negative"),

  subjectFee: z
    .string()
    .min(1, "Subject fee is required")
    .refine(
      (value) => !isNaN(Number(value)) && Number(value) >= 0,
      "Enter a valid subject fee",
    ),
});

export const manageSubjectSchema = z
  .object({
    // =====================================================
    // SECTION 1 - SUBJECT DETAILS
    // =====================================================

    curriculumId: z.number().min(0),

    courseId: z.number().min(1, "Please select a Course/Class Name"),

    subName: z
      .string()
      .trim()
      .min(1, "Subject Name is required")
      .max(150, "Subject Name cannot exceed 150 characters"),

    description: z
      .string()
      .max(200, "Description cannot exceed 200 characters")
      .optional(),

    duration: z
      .string()
      .refine(
        (value) => value === "" || (!isNaN(Number(value)) && Number(value) > 0),
        "Enter a valid duration",
      ),

    durationUnit: z.enum(["Year", "Month", "Week", "Day"]),

    // =====================================================
    // FEES DETAILS
    // =====================================================

    feesType: z.enum(["Full Subject Fees", "Monthly", "Hourly"]).optional(),

    subjectFee: z.string().optional(),

    adhocInstallment: z.boolean().optional(),

    isTaxable: z.boolean().optional(),

    taxType: z.enum(["Including Tax", "Excluding Tax"]).optional(),

    // =====================================================
    // MONTHLY SUB FEE DETAILS
    // =====================================================

    // 1 = Fixed Duration
    // 2 = Ongoing
    // 3 = Course End Date
    subFeesType: z.enum(["1", "2", "3"]).optional(),

    // Used for Fixed Duration and Ongoing
    noofMonths: z.string().optional(),

    // Used for Course End Date
    courseEndDate: z.string().optional(),

    // =====================================================
    // SUBJECT ATTRIBUTES
    // =====================================================

    prorateAmount: z.boolean(),

    installmentAllowed: z.boolean(),

    maxInstallments: z.string().optional(),

    // =====================================================
    // TEMPLATE
    // =====================================================

    createTemplate: z.boolean(),

    intervalOption: z.enum(["Fixed", "Monthly", "Quarterly"]).optional(),

    templateStatus: z.enum(["Active", "Inactive"]).optional(),

    fixedDays: z.string().optional(),

    monthlyDueDate: z.string().optional(),

    quarterlyDueDate: z.string().optional(),

    installments: z.array(installmentSchema).optional(),

    // =====================================================
    // STATUS
    // =====================================================

    status: z.number().int().min(0).max(1),

    // IMPORTANT:
    // Used only for validation.
    // Do not send this to the API.
    hasCourseFees: z.boolean().optional(),
  })

  .superRefine((data, ctx) => {
    // =====================================================
    // FEES DETAILS
    // ONLY VALIDATE WHEN SECTION IS VISIBLE
    // =====================================================

    if (!data.hasCourseFees) {
      // ---------------------------------------------------
      // Fees Type
      // ---------------------------------------------------

      if (!data.feesType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["feesType"],
          message: "Please select Fees Type",
        });
      }

      // ---------------------------------------------------
      // Subject Fee
      // ---------------------------------------------------

      if (!data.subjectFee || data.subjectFee === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subjectFee"],
          message: "Subject fee is required",
        });
      } else if (
        isNaN(Number(data.subjectFee)) ||
        Number(data.subjectFee) < 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subjectFee"],
          message: "Enter a valid Subject fee",
        });
      }

      // ---------------------------------------------------
      // Taxable
      // ---------------------------------------------------

      if (data.isTaxable === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["isTaxable"],
          message: "Please select Taxable",
        });
      }

      // ---------------------------------------------------
      // Tax Type
      // ---------------------------------------------------

      if (data.isTaxable && !data.taxType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxType"],
          message: "Please select tax type",
        });
      }
      // ===================================================
      // MONTHLY FEES
      // ===================================================

      if (data.feesType === "Monthly") {
        // -------------------------------------------------
        // One sub-fee option is mandatory
        // -------------------------------------------------

        if (!data.subFeesType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["subFeesType"],
            message: "Please select an option",
          });
        }

        // -------------------------------------------------
        // Fixed Duration
        // subFeesType = 1
        // -------------------------------------------------

        if (data.subFeesType === "1") {
          if (
            !data.noofMonths ||
            data.noofMonths.trim() === "" ||
            isNaN(Number(data.noofMonths)) ||
            Number(data.noofMonths) < 1 ||
            !Number.isInteger(Number(data.noofMonths))
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["noofMonths"],
              message: "No. of months is required",
            });
          }
        }

        // -------------------------------------------------
        // Ongoing
        // subFeesType = 2
        // -------------------------------------------------

        if (data.subFeesType === "2") {
          if (
            !data.noofMonths ||
            data.noofMonths.trim() === "" ||
            isNaN(Number(data.noofMonths)) ||
            Number(data.noofMonths) < 1 ||
            !Number.isInteger(Number(data.noofMonths))
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["noofMonths"],
              message: "No. of months is required",
            });
          }
        }

        // -------------------------------------------------
        // Course End Date
        // subFeesType = 3
        // -------------------------------------------------

        if (data.subFeesType === "3") {
          if (!data.courseEndDate?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["courseEndDate"],
              message: "Course End Date is required",
            });
          }
        }
      }
      // ===================================================
      // MONTHLY FEES
      // ===================================================

      // if (data.feesType === "Monthly") {
      //   // -------------------------------------------------
      //   // One sub-fee option is mandatory
      //   // -------------------------------------------------

      //   if (!data.subFeesType) {
      //     ctx.addIssue({
      //       code: z.ZodIssueCode.custom,
      //       path: ["subFeesType"],
      //       message: "Please select an option",
      //     });
      //   }

      //   // -------------------------------------------------
      //   // Fixed Duration
      //   // subFeesType = 1
      //   // -------------------------------------------------

      //   if (data.subFeesType === "1") {
      //     if (
      //       !data.noofMonths ||
      //       data.noofMonths.trim() === "" ||
      //       isNaN(Number(data.noofMonths)) ||
      //       Number(data.noofMonths) < 1 ||
      //       Number(data.noofMonths) > 31 ||
      //       !Number.isInteger(Number(data.noofMonths))
      //     ) {
      //       ctx.addIssue({
      //         code: z.ZodIssueCode.custom,
      //         path: ["noofMonths"],
      //         message: "Days must be between 1 and 31",
      //       });
      //     }
      //   }

      //   // -------------------------------------------------
      //   // Ongoing
      //   // subFeesType = 2
      //   // -------------------------------------------------

      //   if (data.subFeesType === "2") {
      //     if (
      //       !data.noofMonths ||
      //       data.noofMonths.trim() === "" ||
      //       isNaN(Number(data.noofMonths)) ||
      //       Number(data.noofMonths) < 1 ||
      //       Number(data.noofMonths) > 31 ||
      //       !Number.isInteger(Number(data.noofMonths))
      //     ) {
      //       ctx.addIssue({
      //         code: z.ZodIssueCode.custom,
      //         path: ["noofMonths"],
      //         message: "Due date must be between 1 and 31",
      //       });
      //     }
      //   }

      //   // -------------------------------------------------
      //   // Course End Date
      //   // subFeesType = 3
      //   // -------------------------------------------------

      //   if (data.subFeesType === "3") {
      //     if (!data.courseEndDate?.trim()) {
      //       ctx.addIssue({
      //         code: z.ZodIssueCode.custom,
      //         path: ["courseEndDate"],
      //         message: "Course End Date is required",
      //       });
      //     }
      //   }
      // }

      // ===================================================
      // FULL SUBJECT FEES + TEMPLATE
      // ===================================================

      if (data.feesType === "Full Subject Fees" && data.createTemplate) {
        if (!data.templateStatus) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["templateStatus"],
            message: "Please select template status",
          });
        }

        if (!data.intervalOption) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["intervalOption"],
            message: "Please select installment interval",
          });
        }

        if (data.intervalOption === "Fixed") {
          if (
            !data.fixedDays ||
            isNaN(Number(data.fixedDays)) ||
            Number(data.fixedDays) <= 0
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["fixedDays"],
              message: "Enter valid fixed days",
            });
          }
        }

        if (data.intervalOption === "Monthly") {
          if (
            !data.monthlyDueDate ||
            isNaN(Number(data.monthlyDueDate)) ||
            Number(data.monthlyDueDate) < 1 ||
            Number(data.monthlyDueDate) > 31
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["monthlyDueDate"],
              message: "Due date must be between 1 and 31",
            });
          }
        }

        if (data.intervalOption === "Quarterly") {
          if (!data.quarterlyDueDate?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["quarterlyDueDate"],
              message: "Course End Date is required",
            });
          }
        }

        // ---------------------------------------------------
        // Installments
        // ---------------------------------------------------

        if (!data.installments || data.installments.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["installments"],
            message: "At least one installment is required",
          });
        } else if (data.subjectFee !== undefined && data.subjectFee !== "") {
          const installmentTotal = data.installments.reduce(
            (sum, row) => sum + Number(row.subjectFee || 0),
            0,
          );

          if (installmentTotal !== Number(data.subjectFee)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["installments"],
              message: `Installment total must equal subject fee ${Number(
                data.subjectFee,
              ).toFixed(2)}`,
            });
          }
        }
      }
    }

    // =====================================================
    // SUBJECT ATTRIBUTES
    // =====================================================

    if (data.installmentAllowed) {
      if (
        !data.maxInstallments ||
        data.maxInstallments === "" ||
        isNaN(Number(data.maxInstallments)) ||
        Number(data.maxInstallments) < 1 ||
        !Number.isInteger(Number(data.maxInstallments))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxInstallments"],
          message: "Maximum installment must be a whole number greater than 0",
        });
      }
    }
  });

export type ManageSubjectFormValues = z.infer<typeof manageSubjectSchema>;
