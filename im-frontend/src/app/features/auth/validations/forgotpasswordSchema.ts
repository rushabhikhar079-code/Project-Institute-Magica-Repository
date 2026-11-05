// validation/forgotPasswordSchema.ts

import { z } from "zod";

export const forgotPasswordSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers.')     
    .min(1, "Username is required.")
    .max(45, 'Password cannot exceed 45 characters.')
    .trim(),
});

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;