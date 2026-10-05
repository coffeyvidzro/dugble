import { describe, expect, test } from "bun:test";
import type { TemplateFormState } from "./editor-types";
import { interpolatePreview, toApiPayload } from "./template-form-model";

const base: TemplateFormState = {
  name: "  Welcome  ",
  alias: " ",
  category: "welcome",
  from: "",
  subject: "Hi",
  replyTo: "a@x.com, , b@x.com",
  text: "",
  htmlBody: "<p>{{{NAME}}} {{count}}</p>",
  variables: [
    { id: "1", key: "NAME", type: "string", fallbackValue: "there" },
    { id: "2", key: "count", type: "number", fallbackValue: "3" },
    { id: "3", key: "  ", type: "string", fallbackValue: "ignored" },
  ],
};

describe("template form model", () => {
  test("preview substitutes both placeholder syntaxes", () => {
    expect(interpolatePreview(base.htmlBody, base.variables)).toBe(
      "<p>there 3</p>",
    );
  });

  test("payload trims, drops blanks and coerces number fallbacks", () => {
    const payload = toApiPayload(base);
    expect(payload.name).toBe("Welcome");
    expect(payload.alias).toBeUndefined();
    expect(payload.reply_to).toEqual(["a@x.com", "b@x.com"]);
    expect(payload.variables).toEqual([
      { key: "NAME", type: "string", fallback_value: "there" },
      { key: "count", type: "number", fallback_value: 3 },
    ]);
  });
});
