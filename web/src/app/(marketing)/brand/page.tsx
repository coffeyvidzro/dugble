import { AssetDownloads } from "@/components/marketing/brand/asset-downloads";
import { BrandContact } from "@/components/marketing/brand/brand-contact";
import { BrandHero } from "@/components/marketing/brand/brand-hero";
import { ClearSpace } from "@/components/marketing/brand/clear-space";
import { ColorPalette } from "@/components/marketing/brand/color-palette";
import { LogoShowcase } from "@/components/marketing/brand/logo-showcase";
import { TypographyShowcase } from "@/components/marketing/brand/typography-showcase";
import { VoiceTone } from "@/components/marketing/brand/voice-tone";
import { Separator } from "@/components/ui/separator";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Brand Guidelines",
  description:
    "Explore Dugble's official brand guidelines. Download logos, typography, color palettes, and other brand assets.",
  url: "/brand",
});

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
