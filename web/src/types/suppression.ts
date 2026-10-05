// src/types/suppression.ts

import { z } from "zod";

export const suppressionSchema = z.object({
  id: z.string().uuid(),
  object: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  origin: z.string().optional().nullable(),
  source_id: z.string().optional().nullable(), // Fixed: allows null values from backend
  created_at: z.string().datetime().optional().nullable(),
});

export type Suppression = z.infer<typeof suppressionSchema>;

// Robust schema to handle arrays, wrapped { data: [...] }, or object maps { '0': {...}, '1': {...} }
export const suppressionsListSchema = z
  .unknown()
  .transform((val): Suppression[] => {
    if (Array.isArray(val)) {
      return val.map((item) => suppressionSchema.parse(item));
    }
    if (val && typeof val === "object") {
      // Handle wrapper objects like { data: [...] } or dictionary objects { '0': {...} }
      const container = "data" in val ? (val as { data: unknown }).data : val;
      if (Array.isArray(container)) {
        return container.map((item) => suppressionSchema.parse(item));
      }
      if (container && typeof container === "object") {
        return Object.values(container).map((item) =>
          suppressionSchema.parse(item),
        );
      }
    }
    return [];
  });

export const createSuppressionInputSchema = z.object({
  email: z.string().email({ message: "A valid email is required" }),
});

export type CreateSuppressionInput = z.infer<
  typeof createSuppressionInputSchema
>;

export const createdSuppressionSchema = z.object({
  object: z.literal("suppression").optional().nullable(),
  id: z.string().uuid(),
});

export type CreatedSuppression = z.infer<typeof createdSuppressionSchema>;

export const suppressionDeletedSchema = z.object({
  id: z.string().uuid(),
});
