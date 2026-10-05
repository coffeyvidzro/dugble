// src/lib/security/route-params.ts

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Template aliases per the API contract: `^[A-Za-z0-9_-]+$`, max 100. */
const TEMPLATE_ALIAS = /^[A-Za-z0-9_-]{1,100}$/;

/**
 * Route params flow into API paths (`/emails/${id}`). Validating them at the
 * route boundary means a crafted URL like `/dashboard/email/emails/..%2Fusers`
 * can never make the browser call an unintended endpoint.
 */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export function isTemplateIdentifier(value: string): boolean {
  return UUID.test(value) || TEMPLATE_ALIAS.test(value);
}
