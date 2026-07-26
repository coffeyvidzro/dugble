import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      {children}
    </main>
  );
}
