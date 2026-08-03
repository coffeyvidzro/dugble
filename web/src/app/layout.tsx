import { CommandPalette } from "@/components/command-palette/command-palette";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontHeading, fontMono, fontSans } from "@/utils/fonts";
import { constructMetadata } from "@/utils/metadata";
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
            <body
                suppressHydrationWarning
                className="flex min-h-full flex-col bg-background text-foreground antialiased"
            >
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
