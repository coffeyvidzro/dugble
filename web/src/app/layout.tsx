import { CommandPalette } from "@/components/command-palette/command-palette";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontHeading, fontMono, fontSans } from "@/utils/fonts";
import { constructMetadata } from "@/utils/metadata";
import { serializeDugbleSchemaGraph } from "@/utils/metagraph";
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
        <script
          id="dugble-schema-graph"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeDugbleSchemaGraph(),
          }}
        />
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
