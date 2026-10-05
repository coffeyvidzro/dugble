import { z } from "zod";

const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function isSafeLinkUrl(value: string): boolean {
  try {
    return LINK_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const httpsUrlSchema = z
  .string()
  .refine(isHttpsUrl, { message: "Expected an https:// URL." });
