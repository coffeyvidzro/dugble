import type { TemplateCategory, TemplateStatus } from "../types";

export type PreviewViewport = "desktop" | "mobile";
export type MobilePane = "code" | "preview";

export type TemplateFormState = {
    name: string;
    subject: string;
    previewText: string;
    category: TemplateCategory;
    status: TemplateStatus;
    htmlBody: string;
};
