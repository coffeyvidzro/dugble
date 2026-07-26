import { AnimatedGrid } from "./animated-grid";
import { ApiPlayground } from "./api-playground";
import { FloatingOrbs } from "./floating-orbs";
import { HeroActions } from "./hero-actions";
import { HeroBadge } from "./hero-badge";
import { HeroContent } from "./hero-content";
import { HeroStats } from "./hero-stats";

export function Hero() {
  return (
    <section className="relative isolate min-h-[86svh] overflow-hidden rounded-2xl">
      <AnimatedGrid />
      <FloatingOrbs />

      <div className="relative grid min-h-[86svh] items-center gap-14 py-16 px-6 mx-auto lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="min-w-0 space-y-8">
          <div className="animate-fade-up">
            <HeroBadge />
          </div>
          <HeroContent />
          <HeroActions />
          <HeroStats />
        </div>

        <div className="min-w-0 animate-fade-up [animation-delay:120ms]">
          <ApiPlayground />
        </div>
      </div>
    </section>
  );
}
