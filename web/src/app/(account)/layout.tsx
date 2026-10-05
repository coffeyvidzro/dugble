// src/app/(account)/layout.tsx

import type { ReactNode } from "react";
import { RootDocument } from "@/components/layout/root-document";
import { getCspNonce } from "@/lib/security/nonce.server";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({ preset: "auth" });

/**
 * Root layout for signed-in, non-dashboard flows (team invitations, email
 * change). URLs are unchanged — route groups don't affect paths.
 */
export default async function AccountLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const nonce = await getCspNonce();
  return <RootDocument nonce={nonce}>{children}</RootDocument>;
}
