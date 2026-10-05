// src/app/(auth)/layout.tsx

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { RootDocument } from "@/components/layout/root-document";
import { getCspNonce } from "@/lib/security/nonce.server";
import { getSession } from "@/lib/session";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({ preset: "auth" });

/** Root layout for sign-in flows: strict nonce CSP; signed-in users go to the app. */
export default async function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [session, nonce] = await Promise.all([getSession(), getCspNonce()]);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <RootDocument nonce={nonce}>
      <main className="min-h-svh bg-background text-foreground">
        {children}
      </main>
    </RootDocument>
  );
}
