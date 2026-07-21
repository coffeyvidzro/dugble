import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Separator } from "@/components/ui/separator";

const lines = [
  ["Sandbox", "Build and test before sending production traffic."],
  ["Email", "Transactional email usage tracked separately from SMS."],
  ["SMS", "A2P SMS usage based on production message volume."],
  ["Volume", "Talk to Dugble when OTP or notification traffic grows."],
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-8 lg:px-8">
        <MarketingNav />
        <section className="space-y-6 py-12">
          <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Pricing
          </p>
          <h1 className="max-w-4xl font-heading text-5xl font-semibold tracking-tight md:text-6xl">
            Usage-based pricing by channel.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-8">
            Dugble pricing should stay easy to reason about: email and SMS are
            separate, test traffic is visible, and production volume maps to the
            messages your product sends.
          </p>
        </section>
        <Separator />
        <section className="divide-y rounded-[2rem] border">
          {lines.map(([title, description]) => (
            <div
              key={title}
              className="grid gap-3 p-6 md:grid-cols-[180px_1fr]"
            >
              <h2 className="font-semibold">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
