import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MarketingFeature = {
  title: string;
  description: string;
};

type MarketingContentPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: {
    href: string;
    label: string;
  };
  secondaryCta?: {
    href: string;
    label: string;
  };
  features: MarketingFeature[];
  checklist?: string[];
  code?: string;
  note?: {
    title: string;
    description: string;
  };
};

export function FocusedMarketingPage({
  eyebrow = "Dugble",
  title,
  description,
  primaryCta = { href: "/sign-up", label: "Start building" },
  secondaryCta = { href: "/quickstart", label: "View quickstart" },
  features,
  checklist = [],
  code,
  note,
}: MarketingContentPageProps) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-8 lg:px-8">
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
            <a href="/blog" className="hover:text-foreground">
              Blog
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

        <section className="grid items-center gap-8 py-12 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              {eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight md:text-6xl">
                {title}
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground leading-8">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<a href={primaryCta.href} />}>
                {primaryCta.label}
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<a href={secondaryCta.href} />}
              >
                {secondaryCta.label}
              </Button>
            </div>
          </div>

          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>{note?.title ?? "Built for product teams"}</CardTitle>
              <CardDescription>
                {note?.description ??
                  "A focused A2P messaging surface for teams that care about reliable delivery and developer experience."}
              </CardDescription>
            </CardHeader>
            {(code || checklist.length > 0) && (
              <CardContent>
                {code ? (
                  <pre className="overflow-x-auto rounded-3xl bg-muted p-5 text-sm leading-7">
                    <code>{code}</code>
                  </pre>
                ) : (
                  <ul className="space-y-3 text-muted-foreground text-sm">
                    {checklist.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="text-primary">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            )}
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
