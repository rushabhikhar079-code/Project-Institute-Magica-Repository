import { z } from "zod";

export const topicSchema = z.object({
  curriculumId: z.number().optional(),

  courseId: z.number().min(1, "Course is required"),

  subjectId: z.number().min(1, "Subject is required"),

  topicSeqNum: z.number().min(0, "Topic sequence is required"),

  topicName: z.string().trim().min(1, "Topic name is required"),

  topicDurId: z.number().min(1, "Duration type is required"),

  topicDuration: z.string().trim().min(1, "Topic duration is required"),

  remark: z.string().optional(),

  isActive: z.number(),

  isReflect: z.boolean(),
});

export type TopicFormValidation = z.infer<typeof topicSchema>;
