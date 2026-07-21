import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Separator } from "@/components/ui/separator";

const controls = [
  "Server-side API keys",
  "Webhook signatures",
  "CSRF tokens for unsafe dashboard actions",
  "Session checks for authenticated routes",
  "Workspace-scoped access",
  "Audit log foundation",
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-8 lg:px-8">
        <MarketingNav />
        <section className="space-y-6 py-12">
          <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Security
          </p>
          <h1 className="max-w-4xl font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Security for message-sending infrastructure.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-8">
            Dugble protects the surfaces that matter for A2P workflows: keys,
            sessions, webhooks, workspace access, and message logs.
          </p>
        </section>
        <Separator />
        <section className="grid gap-4 sm:grid-cols-2">
          {controls.map((control) => (
            <div key={control} className="rounded-3xl border p-5 font-medium">
              {control}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
