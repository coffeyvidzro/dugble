import { Geist, Geist_Mono, Mona_Sans } from "next/font/google";

export const fontSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const fontMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const fontHeading = Mona_Sans({
    variable: "--font-mona-sans",
    subsets: ["latin"],
});
