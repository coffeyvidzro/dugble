// src/types/segment.ts

import { z } from "zod";

export const segmentSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  name: z.string().min(1),
  created_at: z.string().datetime(),
});

export type Segment = z.infer<typeof segmentSchema>;

export const segmentsListSchema = z.array(segmentSchema);

export const createSegmentInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
});

export type CreateSegmentInput = z.infer<typeof createSegmentInputSchema>;

export const segmentDeletedSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  name: z.string(),
  created_at: z.string().datetime(),
});

export const audienceSizeSchema = z.object({
  segment_id: z.string().uuid(),
  count: z.number().int().nonnegative(),
});

export type AudienceSize = z.infer<typeof audienceSizeSchema>;
