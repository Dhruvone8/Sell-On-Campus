import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  department: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().trim().max(50).nullable().optional()
  ),
  year: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().int().min(1).max(6).nullable().optional()
  ),
  profileImageUrl: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().trim().url().nullable().optional()
  ),
  removeProfileImage: z.preprocess(
    (val) => val === true || val === "true",
    z.boolean().optional()
  ),
});
