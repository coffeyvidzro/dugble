import type { Metadata } from "next";

import { CommandPalette } from "@/components/command-palette/command-palette";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { baseUrl } from "@/lib/site";
import { fontHeading, fontMono, fontSans } from "@/utils/fonts";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "Dugble | Developer-first A2P email and SMS APIs",
        template: "%s | Dugble",
    },
    description:
        "Developer-first A2P email and SMS APIs for African startups and teams.",
    keywords: [
        "A2P messaging",
        "SMS API",
        "Email API",
        "OTP delivery",
        "developer infrastructure",
    ],
    openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        siteName: "Dugble",
        images: [
            {
                url: "/og",
                width: 1200,
                height: 630,
                alt: "Dugble Developer Infrastructure",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Dugble | Developer-first A2P email and SMS APIs",
        description:
            "Developer-first A2P email and SMS APIs for African startups and teams.",
        images: ["/og"],
    },
    alternates: {
        canonical: "/",
    },
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
