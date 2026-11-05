import z from "zod";

export const curriculumSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Curriculum name must be at least 2 characters")
    .max(100, "Curriculum name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(200, "Description must not exceed 200 characters"),

  status: z.boolean().optional(),
});

export type CurriculumFormValidation = z.infer<typeof curriculumSchema>;
