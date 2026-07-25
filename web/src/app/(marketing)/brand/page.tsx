import type { Metadata } from "next";

import { Separator } from "@/components/ui/separator";
import { BrandHero } from "@/components/marketing/brand/brand-hero";
import { LogoShowcase } from "@/components/marketing/brand/logo-showcase";
import { ColorPalette } from "@/components/marketing/brand/color-palette";
import { TypographyShowcase } from "@/components/marketing/brand/typography-showcase";
import { VoiceTone } from "@/components/marketing/brand/voice-tone";
import { ClearSpace } from "@/components/marketing/brand/clear-space";
import { AssetDownloads } from "@/components/marketing/brand/asset-downloads";
import { BrandContact } from "@/components/marketing/brand/brand-contact";

export const metadata: Metadata = {
    title: "Brand Guidelines | Dugble",
    description:
        "Explore Dugble's official brand guidelines. Download logos, typography, color palettes, and other brand assets.",
    openGraph: {
        title: "Brand Guidelines | Dugble",
        description:
            "Explore Dugble's official brand guidelines. Download logos, typography, color palettes, and other brand assets.",
        url: "https://dugble.com/brand",
    },
};

export default function Page() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
                <BrandHero />
                <Separator />
                <LogoShowcase />
                <ColorPalette />
                <TypographyShowcase />
                <VoiceTone />
                <ClearSpace />
                <AssetDownloads />
                <BrandContact />
            </div>
        </main>
    );
}
