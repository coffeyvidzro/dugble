import Image from "next/image";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";
import { TerminalLink } from "../terminal-link";

export function BrandHero() {
  return (
    <section className="relative isolate overflow-hidden py-16 text-center rounded-2xl px-6">
      <AnimatedGrid />
      <FloatingOrbs />

      <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center space-y-8">
        <Image
          src="/brand/lockup-light-bg.svg"
          alt="Dugble"
          width={222}
          height={40}
          className="h-10 w-auto dark:hidden"
        />
        <Image
          src="/brand/lockup-dark-bg.svg"
          alt="Dugble"
          width={222}
          height={40}
          className="hidden h-10 w-auto dark:block"
        />
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Brand
          </p>
          <h1 className="text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
            Dugble, in every context that needs it.
          </h1>
          <p className="mx-auto max-w-lg text-pretty text-lg leading-8 text-muted-foreground">
            Logos, color, type, and voice for partners, integrators, press, and
            anyone writing about Dugble.
          </p>
        </div>
        <TerminalLink href="#assets">jump to downloads</TerminalLink>
      </Reveal>
    </section>
  );
}
