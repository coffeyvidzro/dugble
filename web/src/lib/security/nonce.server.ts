// src/lib/security/nonce.server.ts

import "server-only";

import { headers } from "next/headers";

/** The per-request CSP nonce set by `proxy.ts` (undefined outside nonce routes). */
export async function getCspNonce(): Promise<string | undefined> {
  return (await headers()).get("x-nonce") ?? undefined;
}
