import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  total_pages: z.number(),
});
export type Pagination = z.infer<typeof paginationSchema>;

export function paginatedEnvelopeSchema<T extends z.ZodType>(itemSchema: T) {
  return z
    .object({
      success: z.literal(true),
      data: z.array(itemSchema),
      meta: z.object({ pagination: paginationSchema }),
    })
    .transform((response) => ({
      items: response.data,
      pagination: response.meta.pagination,
    }));
}
