import Image from "next/image";
import { Reveal } from "@/components/marketing/reveal";

const logos = [
  {
    title: "Mark",
    description: "For favicons, app icons, and tight spaces.",
    dark: "/brand/mark-dark-bg.svg",
    light: "/brand/mark-light-bg.svg",
    heightClass: "h-10",
  },
  {
    title: "Wordmark",
    description: "When the mark alone isn't enough context.",
    dark: "/brand/wordmark-dark-bg.svg",
    light: "/brand/wordmark-light-bg.svg",
    heightClass: "h-8",
  },
  {
    title: "Lockup",
    description: "The default - mark and wordmark together.",
    dark: "/brand/lockup-dark-bg.svg",
    light: "/brand/lockup-light-bg.svg",
    heightClass: "h-8",
  },
];

export function LogoShowcase() {
  return (
    <section className="space-y-8">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Logos
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Three lockups. Two backgrounds each.
        </h2>
        <p className="leading-7 text-muted-foreground">
          Each variant ships pre-optimized for its background. Don't recolor the
          light-background version and drop it on dark, or vice versa.
        </p>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-3">
        {logos.map((logo, i) => (
          <Reveal
            key={logo.title}
            delay={i * 80}
            className="space-y-3 rounded-2xl border bg-card/60 p-4"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="flex h-28 items-center justify-center rounded-xl bg-[#09090B]">
                <Image
                  src={logo.dark}
                  alt={`${logo.title} on dark`}
                  width={
                    logo.title === "Mark"
                      ? 40
                      : logo.title === "Wordmark"
                        ? 170
                        : 222
                  }
                  height={40}
                  className={logo.heightClass}
                />
              </div>
              <div className="flex h-28 items-center justify-center rounded-xl bg-white">
                <Image
                  src={logo.light}
                  alt={`${logo.title} on light`}
                  width={
                    logo.title === "Mark"
                      ? 40
                      : logo.title === "Wordmark"
                        ? 170
                        : 222
                  }
                  height={40}
                  className={logo.heightClass}
                />
              </div>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {logo.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {logo.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
