// src/components/layout/root-document.tsx

import type { ReactNode } from "react";
import { LazyCommandPalette } from "@/components/command-palette/lazy-command-palette";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontHeading, fontMono, fontSans } from "@/utils/fonts";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

/**
 * The <html> shell shared by every root layout.
 *
 * Route groups own their root layouts so that authenticated/auth areas can
 * read the per-request CSP nonce (which forces dynamic rendering) while the
 * marketing site stays statically generated.
 */
export function RootDocument({
  children,
  nonce,
}: {
  children: ReactNode;
  /** CSP nonce from `proxy.ts`; omitted on statically rendered pages. */
  nonce?: string;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fontSans.variable, fontMono.variable, fontHeading.variable)}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-background text-foreground antialiased"
      >
        <AppProviders>
          <ThemeProvider nonce={nonce}>
            <TooltipProvider>
              {children}
              <LazyCommandPalette />
              <Toaster richColors closeButton />
            </TooltipProvider>
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
