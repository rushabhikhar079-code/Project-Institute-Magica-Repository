import { z } from "zod";

export const importTopicSchema = z.object({
  courseId: z.coerce.number().min(1, "Course is required"),

  subjectId: z.coerce.number().min(1, "Subject is required"),

  excelFile: z
    .instanceof(File, {
      message: "Excel file is required",
    })
    .refine(
      (file) => {
        const extension = file.name.split(".").pop()?.toLowerCase();

        return extension === "xls" || extension === "xlsx";
      },
      {
        message: "Only XLS or XLSX files are allowed",
      },
    )
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must not exceed 10 MB",
    }),
});

export type ImportTopicFormValues = z.infer<typeof importTopicSchema>;
