import type { TemplateResource } from "@/types/template-api";
import { defaultHtmlForCategory } from "../template-content";
import type { TemplateFormState } from "./editor-types";

export function toFormState(template?: TemplateResource): TemplateFormState {
  if (template) {
    return {
      name: template.name,
      alias: template.alias ?? "",
      category: template.category,
      from: template.from ?? "",
      subject: template.subject ?? "",
      replyTo: template.reply_to.join(", "),
      text: template.text ?? "",
      htmlBody: template.html,
      variables: template.variables.map((v) => ({
        id: v.id,
        key: v.key,
        type: v.type,
        fallbackValue:
          v.fallback_value !== undefined ? String(v.fallback_value) : "",
      })),
    };
  }
  return {
    name: "Untitled template",
    alias: "",
    category: "custom",
    from: "",
    subject: "",
    replyTo: "",
    text: "",
    htmlBody: defaultHtmlForCategory("custom"),
    variables: [],
  };
}

export function interpolatePreview(
  html: string,
  variables: TemplateFormState["variables"],
): string {
  return variables.reduce((acc, variable) => {
    if (!variable.key.trim()) return acc;
    const value = variable.fallbackValue || `{${variable.key}}`;
    return acc
      .split(`{{{${variable.key}}}}`)
      .join(value)
      .split(`{{${variable.key}}}`)
      .join(value);
  }, html);
}

export function toApiPayload(form: TemplateFormState) {
  return {
    name: form.name.trim() || "Untitled template",
    html: form.htmlBody,
    alias: form.alias.trim() || undefined,
    category: form.category,
    from: form.from.trim() || undefined,
    subject: form.subject.trim() || undefined,
    reply_to: form.replyTo
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean),
    text: form.text.trim() || undefined,
    variables: form.variables
      .filter((v) => v.key.trim().length > 0)
      .map((v) => ({
        key: v.key.trim(),
        type: v.type,
        fallback_value:
          v.type === "number" && v.fallbackValue
            ? Number(v.fallbackValue)
            : v.fallbackValue || undefined,
      })),
  };
}
