// src/lib/api/assert-permission.ts

export function assertPermission(
  condition: boolean,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
