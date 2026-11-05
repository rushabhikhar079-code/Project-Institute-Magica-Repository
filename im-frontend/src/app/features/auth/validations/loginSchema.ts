import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required").max(45, 'Username cannot exceed 45 characters.'),

  password: z
    .string()
    .min(1, "Password is required").max(45, 'Password cannot exceed 45 characters.'),
    

  captcha: z
    .string()
    .min(1, "Captcha is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;