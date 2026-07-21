import { MarketingNav } from "@/components/marketing/marketing-nav";

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-8 lg:px-8">
        <MarketingNav />
        <section className="space-y-6 py-16">
          <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
            About Dugble
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Messaging infrastructure should be easier to debug.
          </h1>
          <p className="text-lg text-muted-foreground leading-8">
            Dugble is being built for teams that send customer-critical messages
            — OTPs, receipts, alerts, and updates — and need to know exactly
            what happened after every API call.
          </p>
          <p className="text-lg text-muted-foreground leading-8">
            The point of view is simple: send the message, keep the receipt, and
            make every failure easier to explain.
          </p>
        </section>
      </div>
    </main>
  );
}
