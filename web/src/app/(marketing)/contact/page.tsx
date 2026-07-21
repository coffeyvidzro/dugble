import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Button } from "@/components/ui/button";

const reasons = [
  "Early access",
  "Product feedback",
  "Volume SMS",
  "Partnerships",
  "Support",
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-8 lg:px-8">
        <MarketingNav />
        <section className="space-y-6 py-16">
          <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Contact
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Talk to Dugble about A2P messaging.
          </h1>
          <p className="text-lg text-muted-foreground leading-8">
            Reach out if you are building OTP, alert, receipt, or notification
            workflows and want sharper infrastructure behind them.
          </p>
          <Button size="lg" render={<a href="mailto:hello@dugble.com" />}>
            Email hello@dugble.com
          </Button>
        </section>
        <section className="flex flex-wrap gap-2">
          {reasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full border px-4 py-2 text-sm"
            >
              {reason}
            </span>
          ))}
        </section>
      </div>
    </main>
  );
}
