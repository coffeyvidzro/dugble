import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function MarketingPlaceholderPage({
  title,
  description,
  eyebrow = "Dugble",
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="font-heading font-semibold text-lg">
            Dugble
          </a>
          <nav className="hidden items-center gap-6 text-muted-foreground text-sm md:flex">
            <a href="/email-api" className="hover:text-foreground">
              Email API
            </a>
            <a href="/sms-api" className="hover:text-foreground">
              SMS API
            </a>
            <a href="/pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="/quickstart" className="hover:text-foreground">
              Quickstart
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<a href="/login" />}>
              Sign in
            </Button>
            <Button render={<a href="/sign-up" />}>Start building</Button>
          </div>
        </header>

        <section className="grid min-h-[60svh] items-center gap-8 py-12 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              {eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight md:text-6xl">
                {title}
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<a href="/sign-up" />}>
                Start building
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<a href="/quickstart" />}
              >
                View quickstart
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Coming soon</CardTitle>
              <CardDescription>
                This marketing page is scaffolded and ready for detailed product
                copy, visuals, and conversion sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-3xl bg-muted p-4 text-sm">
                <code>{`curl https://api.dugble.com/v1/messages/sms \\
  -H "Authorization: Bearer dug_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"to":"+233501234567","body":"Your code is 123456"}'`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
