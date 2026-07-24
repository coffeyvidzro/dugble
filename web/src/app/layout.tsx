import type { Metadata } from "next";

import { CommandPalette } from "@/components/command-palette/command-palette";
import { fontHeading, fontMono, fontSans } from "@/utils/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
    title: "Dugble",
    description:
        "Developer-first A2P email and SMS APIs for African startups and teams.",
};

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
