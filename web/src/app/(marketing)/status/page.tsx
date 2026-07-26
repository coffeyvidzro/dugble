import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Status",
  description:
    "Check the platform health and system status for Dugble's API, dashboard, and delivery networks.",
  openGraph: {
    title: "System Status",
    description:
      "Check the platform health and system status for Dugble's API, dashboard, and delivery networks.",
    url: "/status",
    type: "website",
  },
};

const systems = [
  "API",
  "Dashboard",
  "SMS delivery",
  "Email delivery",
  "Webhooks",
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-8 lg:px-8">
        <section className="space-y-6 py-16">
          <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Status
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Status page coming soon.
          </h1>
          <p className="text-lg text-muted-foreground leading-8">
            Dugble will publish platform health for the systems customers depend
            on when sending and tracing messages.
          </p>
        </section>
        <section className="divide-y rounded-[2rem] border">
          {systems.map((system) => (
            <div key={system} className="flex items-center justify-between p-5">
              <span>{system}</span>
              <span className="text-muted-foreground text-sm">Planned</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
