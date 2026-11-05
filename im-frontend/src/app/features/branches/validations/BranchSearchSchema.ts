import { z } from "zod";

export const branchSearchSchema = z.object({
  contactPerson: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/,
      "Contact Person contains invalid characters",
    )
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .or(z.literal("")),

  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Contact Number must be exactly 10 digits")
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/,
      "City contains invalid characters",
    )
    .or(z.literal("")),

  status: z.string(),
});
