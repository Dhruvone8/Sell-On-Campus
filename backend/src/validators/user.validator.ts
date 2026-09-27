import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    department: z.string().trim().max(50).nullable().optional(),
    year: z.coerce.number().int().min(1).max(6).nullable().optional(),
    profileImageUrl: z.string().trim().url().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update profile",
  });
