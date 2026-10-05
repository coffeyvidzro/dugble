// src/components/dashboard/email/templates/editor/editor-types.ts

import type {
  TemplateApiCategory,
  TemplateVariableType,
} from "@/types/template-api";

export type PreviewViewport = "desktop" | "mobile";
export type MobilePane = "code" | "preview";

export type EditorVariable = {
  /** Client-only identity so list rows keep their state when others are removed. */
  id: string;
  key: string;
  type: TemplateVariableType;
  fallbackValue: string;
};

export type TemplateFormState = {
  name: string;
  alias: string;
  category: TemplateApiCategory;
  from: string;
  subject: string;
  replyTo: string;
  text: string;
  htmlBody: string;
  variables: EditorVariable[];
};
