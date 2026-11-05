import { z } from "zod";

const optionalString = z.string().trim().optional().or(z.literal(""));

const parseDate = (value: string) => {
  if (!value) return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  return null;
};

export const admissionSearchSchema = z
  .object({
    studentName: optionalString,

    regManual: optionalString,

    phone: optionalString.refine((value) => !value || /^\d{10}$/.test(value), {
      message: "Phone number must contain exactly 10 digits.",
    }),

    regFrDate: optionalString,

    regToDate: optionalString,

    regStatus: z.number(),

    status: z.number(),

    courseId: z.number(),

    subId: z.number(),

    batchId: z.number(),

    enquiryStatus: z.number(),

    notInBatch: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.regFrDate || !data.regToDate) {
      return;
    }

    const fromDate = parseDate(data.regFrDate);
    const toDate = parseDate(data.regToDate);

    if (!fromDate || !toDate) {
      return;
    }

    if (toDate < fromDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regToDate"],
        message: "To Date cannot be earlier than From Date.",
      });
    }
  });
