import type { Metadata } from "next";

import { ChangelogTimeline } from "@/components/marketing/changelog/changelog-timeline";
import { changelogEntries } from "@/components/marketing/changelog/changelog-data";
import { ChangelogHero } from "@/components/marketing/changelog/changelog-hero";
import { Separator } from "@/components/ui/separator";
import { Cta } from "@/components/marketing/cta";

export const metadata: Metadata = {
    title: "Changelog",
    description:
        "Follow the latest product updates, new features, and improvements to Dugble's A2P messaging platform.",
    openGraph: {
        title: "Changelog",
        description:
            "Follow the latest product updates, new features, and improvements to Dugble's A2P messaging platform.",
        url: "/changelog",
    },
};

export default function Page() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
                <ChangelogHero />
                <Separator />
                <ChangelogTimeline entries={changelogEntries} />
                <Cta />
            </div>
        </main>
    );
}
