import { z } from "zod";

export const instituteFilterSchema = z
  .object({
    contactPerson: z
      .string()
      .regex(
        /^[a-zA-Z0-9\s]*$/,
        "Contact Person can only contain letters and numbers.",
      )
      .optional(),

    city: z
      .string()
      .regex(/^[a-zA-Z\s]*$/, "City can only contain letters.")
      .optional(),

    email: z
      .string()
      .email("Invalid email format.")
      .or(z.literal(""))
      .optional(),

    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits.")
      .or(z.literal(""))
      .optional(),

    institutePlan: z.union([z.number(), z.string()]).optional(),

    instituteName: z
      .string()
      .regex(
        /^[a-zA-Z0-9\s]*$/,
        "Institute Name can only contain letters and numbers.",
      ) // Added 0-9
      .optional(),

    type: z.union([z.number(), z.string()]).optional(),
    status: z.union([z.number(), z.string()]).optional(),
    registrationType: z.union([z.number(), z.string()]).optional(),
    expiryDateFrom: z.string().optional(),
    expiryDateTo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.expiryDateFrom && data.expiryDateTo) {
        return new Date(data.expiryDateFrom) <= new Date(data.expiryDateTo);
      }
      return true;
    },
    {
      message: "From date cannot be greater than To date",
      path: ["expiryDateTo"],
    },
  );
