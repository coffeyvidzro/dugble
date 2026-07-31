import { AboutHero } from "@/components/marketing/about/about-hero";
import { ArchitectureLayers } from "@/components/marketing/about/architecture-layers";
import { OriginTimeline } from "@/components/marketing/about/origin-timeline";
import { Principles } from "@/components/marketing/about/principles";
import { UnderTheHood } from "@/components/marketing/about/under-the-hood";
import { Cta } from "@/components/marketing/cta";
import { Separator } from "@/components/ui/separator";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "About",
  description:
    "Dugble is being built for teams that send customer-critical messages and need to know exactly what happened after every API call.",
  path: "/about",
});

const founders = [
  {
    id: "coffey-vidzro",
    name: "Coffey Vidzro",
    role: "Founder",
    description:
      "Focused on backend architecture, telecommunications infrastructure, messaging gateways, and reliable delivery systems.",
  },
  {
    id: "prosper-kessie",
    name: "Prosper Kessie",
    role: "Co-Founder",
    description:
      "Focused on developer experience, API and webhook architecture, SDK engineering, and product design.",
  },
];

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
        <section aria-labelledby="founders-heading" className="space-y-6">
          <div className="max-w-2xl space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              Team
            </p>
            <h2
              id="founders-heading"
              className="font-heading text-3xl font-semibold tracking-tight md:text-4xl"
            >
              Founders building Dugble.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {founders.map((founder) => (
              <article
                id={founder.id}
                key={founder.id}
                className="scroll-mt-24 rounded-2xl border bg-card/60 p-6"
              >
                <p className="font-mono text-xs uppercase tracking-wide text-signal">
                  {founder.role}
                </p>
                <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
                  {founder.name}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {founder.description}
                </p>
              </article>
            ))}
          </div>
        </section>
        <Cta />
      </div>
    </main>
  );
}
