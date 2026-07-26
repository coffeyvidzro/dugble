import type { Metadata } from "next";
import { AboutHero } from "@/components/marketing/about/about-hero";
import { ArchitectureLayers } from "@/components/marketing/about/architecture-layers";
import { OriginTimeline } from "@/components/marketing/about/origin-timeline";
import { Principles } from "@/components/marketing/about/principles";
import { UnderTheHood } from "@/components/marketing/about/under-the-hood";
import { Cta } from "@/components/marketing/cta";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "About",
  description:
    "Dugble is being built for teams that send customer-critical messages and need to know exactly what happened after every API call.",
  openGraph: {
    title: "About Dugble",
    description:
      "Dugble is being built for teams that send customer-critical messages and need to know exactly what happened after every API call.",
    url: "/about",
    type: "website",
  },
};

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
        <AboutHero />
        <Separator />
        <ArchitectureLayers />
        <Principles />
        <UnderTheHood />
        <OriginTimeline />
        <Cta />
      </div>
    </main>
  );
}
