import { changelogEntries } from "@/components/marketing/changelog/changelog-data";
import { ChangelogHero } from "@/components/marketing/changelog/changelog-hero";
import { ChangelogTimeline } from "@/components/marketing/changelog/changelog-timeline";
import { Cta } from "@/components/marketing/cta";
import { Separator } from "@/components/ui/separator";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Changelog",
  description:
    "Follow the latest product updates, new features, and improvements to Dugble's A2P messaging platform.",
  path: "/changelog",
});

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
