// src/lib/security/safe-url.ts

import { z } from "zod";

const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/**
 * True for absolute http(s)/mailto URLs. Anything else — `javascript:`,
 * `data:`, `vbscript:`, relative junk — must never reach an `href`, because
 * React does not block `javascript:` URLs in production.
 */
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

/** Schema for URLs we navigate users to (e.g. hosted checkout). */
export const httpsUrlSchema = z
  .string()
  .refine(isHttpsUrl, { message: "Expected an https:// URL." });
