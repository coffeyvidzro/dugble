// src/components/dashboard/email/templates/types.ts

import {
  type TemplateApiCategory,
  type TemplateApiStatus,
  templateCategorySchema,
} from "@/types/template-api";

/** Template categories are owned by the API contract; the UI never invents its own. */
export type TemplateCategory = TemplateApiCategory;
export type TemplateStatus = TemplateApiStatus;
export type TemplateViewMode = "grid" | "list";

export const TEMPLATE_CATEGORIES: readonly TemplateCategory[] =
  templateCategorySchema.options;

export const CATEGORY_CONFIG: Record<
  TemplateCategory,
  { label: string; colorClass: string; dotClass: string }
> = {
  otp: { label: "OTP", colorClass: "text-chart-1", dotClass: "bg-chart-1" },
  welcome: {
    label: "Welcome",
    colorClass: "text-chart-2",
    dotClass: "bg-chart-2",
  },
  receipt: {
    label: "Receipt",
    colorClass: "text-signal",
    dotClass: "bg-signal",
  },
  alert: {
    label: "Alert",
    colorClass: "text-pending",
    dotClass: "bg-pending",
  },
  notification: {
    label: "Notification",
    colorClass: "text-chart-4",
    dotClass: "bg-chart-4",
  },
  custom: {
    label: "Custom",
    colorClass: "text-chart-5",
    dotClass: "bg-chart-5",
  },
};
