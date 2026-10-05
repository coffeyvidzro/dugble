const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TEMPLATE_ALIAS = /^[A-Za-z0-9_-]{1,100}$/;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export function isTemplateIdentifier(value: string): boolean {
  return UUID.test(value) || TEMPLATE_ALIAS.test(value);
}
