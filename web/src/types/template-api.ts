// src/types/template-api.ts

import { z } from "zod";

export const templateCategorySchema = z.enum([
  "otp",
  "welcome",
  "receipt",
  "alert",
  "notification",
  "custom",
]);
export type TemplateApiCategory = z.infer<typeof templateCategorySchema>;

export const templateStatusSchema = z.enum(["draft", "published"]);
export type TemplateApiStatus = z.infer<typeof templateStatusSchema>;

export const templateVariableTypeSchema = z.enum(["string", "number"]);
export type TemplateVariableType = z.infer<typeof templateVariableTypeSchema>;

export const templateVariableInputSchema = z.object({
  key: z
    .string()
    .regex(
      /^[A-Za-z][A-Za-z0-9_]{0,49}$/,
      "Use letters, numbers, and underscores, starting with a letter.",
    ),
  type: templateVariableTypeSchema,
  fallback_value: z.union([z.string(), z.number()]).optional(),
});
export type TemplateVariableInput = z.infer<typeof templateVariableInputSchema>;

export const templateVariableResourceSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: templateVariableTypeSchema,
  fallback_value: z.union([z.string(), z.number()]).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TemplateVariableResource = z.infer<
  typeof templateVariableResourceSchema
>;

// GET /templates — list items are intentionally thin. No subject, no html,
// no variables, no has_unpublished_versions — only the full resource
// (GET /templates/:template) carries those.
export const templateListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: templateCategorySchema,
  status: templateStatusSchema,
  published_at: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
  alias: z.string().nullish(),
});
export type TemplateListItem = z.infer<typeof templateListItemSchema>;

export const templateListSchema = z.object({
  object: z.literal("list"),
  data: z.array(templateListItemSchema),
  has_more: z.boolean(),
});

export const templateResourceSchema = z.object({
  object: z.literal("template"),
  id: z.string(),
  current_version_id: z.string(),
  alias: z.string().nullish(),
  name: z.string(),
  category: templateCategorySchema,
  created_at: z.string(),
  updated_at: z.string(),
  status: templateStatusSchema,
  published_at: z.string().nullish(),
  from: z.string().nullish(),
  subject: z.string().nullish(),
  reply_to: z.array(z.string()).default([]),
  html: z.string(),
  text: z.string().nullish(),
  variables: z.array(templateVariableResourceSchema).default([]),
  has_unpublished_versions: z.boolean(),
});
export type TemplateResource = z.infer<typeof templateResourceSchema>;

const replyToInputSchema = z.union([z.string(), z.array(z.string())]);

export const createTemplateInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  html: z.string().trim().min(1),
  alias: z
    .string()
    .trim()
    .max(100)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  category: templateCategorySchema,
  from: z
    .string()
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  subject: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  reply_to: replyToInputSchema.optional(),
  text: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  variables: z.array(templateVariableInputSchema).max(50).optional(),
});
export type CreateTemplateInput = z.infer<typeof createTemplateInputSchema>;

// PATCH accepts the same fields, all optional, and creates a new draft
// version — it never mutates content in place.
export const updateTemplateInputSchema = createTemplateInputSchema
  .partial()
  .extend({
    html: z.string().trim().min(1).optional(),
  });
export type UpdateTemplateInput = z.infer<typeof updateTemplateInputSchema>;

export const templateMutationResponseSchema = z.object({
  object: z.string(),
  id: z.string(),
});
export type TemplateMutationResponse = z.infer<
  typeof templateMutationResponseSchema
>;

export const templateDeleteResponseSchema = z.object({
  object: z.string(),
  id: z.string(),
  deleted: z.boolean(),
});

export const templatePreviewInputSchema = z.object({
  version_id: z.string().optional(),
  variables: z.record(z.string(), z.unknown()).optional(),
});
export type TemplatePreviewInput = z.infer<typeof templatePreviewInputSchema>;

export const templatePreviewSchema = z.object({
  template_id: z.string(),
  version_id: z.string(),
  subject: z.string().nullish(),
  html: z.string(),
  text: z.string().nullish(),
  from_email: z.string().nullish(),
  from_name: z.string().nullish(),
  reply_to: z.string().nullish(),
});
export type TemplatePreview = z.infer<typeof templatePreviewSchema>;

export const templateTestSendInputSchema = z.object({
  to: z.string().email("Enter a valid email address."),
  version_id: z.string().optional(),
  variables: z.record(z.string(), z.unknown()).optional(),
});
export type TemplateTestSendInput = z.infer<typeof templateTestSendInputSchema>;

export type TemplateListParams = {
  limit?: number;
  offset?: number;
};

export const TEMPLATE_STATUS_LABEL: Record<TemplateApiStatus, string> = {
  draft: "Draft",
  published: "Published",
};
