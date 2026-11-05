import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    username: z.string().trim().min(1, "Username is required").max(45, 'Username cannot exceed 45 characters.'),

    password: z.string().trim().min(1, "New password is required") .max(45, 'Password cannot exceed 45 characters.'),
  

    confirmpassword: z
      .string()
      .trim()
      .min(1, "Please confirm the new password").max(45, 'Password cannot exceed 45 characters.'),
  })
  .superRefine(({ password, confirmpassword }, ctx) => {
    if (password !== confirmpassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmpassword"],
        message: "Passwords do not match",
      });
    }
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;