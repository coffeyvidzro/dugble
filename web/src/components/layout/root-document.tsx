import type { ReactNode } from "react";
import { LazyCommandPalette } from "@/components/command-palette/lazy-command-palette";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontHeading, fontMono, fontSans } from "@/utils/fonts";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

export function RootDocument({
  children,
  nonce,
}: {
  children: ReactNode;
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
