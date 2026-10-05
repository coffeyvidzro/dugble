import type {
  TemplateApiCategory,
  TemplateVariableType,
} from "@/types/template-api";

export type PreviewViewport = "desktop" | "mobile";
export type MobilePane = "code" | "preview";

export type EditorVariable = {
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
