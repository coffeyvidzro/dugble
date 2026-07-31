import { CommandPalette } from "@/components/command-palette/command-palette";
import { JsonLd } from "@/components/json-ld";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontHeading, fontMono, fontSans } from "@/utils/fonts";
import { constructMetadata } from "@/utils/metadata";
import { getDugbleSchemaGraph } from "@/utils/metagraph";
import "./globals.css";

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} ${fontHeading.variable}`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <JsonLd id="dugble-schema-graph" schema={getDugbleSchemaGraph()} />
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <CommandPalette />
            <Toaster richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
