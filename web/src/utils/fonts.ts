import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const fontSans = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const fontMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
});

export const fontHeading = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
});
