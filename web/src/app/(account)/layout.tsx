import type { ReactNode } from "react";
import { RootDocument } from "@/components/layout/root-document";
import { getCspNonce } from "@/lib/security/nonce.server";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({ preset: "auth" });

export default async function AccountLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const nonce = await getCspNonce();
  return <RootDocument nonce={nonce}>{children}</RootDocument>;
}
