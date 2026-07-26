import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TerminalLink } from "../terminal-link";

export function HeroActions() {
  return (
    <div className="flex flex-row items-center gap-3 animate-fade-up [animation-delay:160ms]">
      <Link
        href="/sign-up"
        className={cn(
          buttonVariants({ size: "lg" }),
          "group relative flex-1 justify-center overflow-hidden font-medium sm:flex-none",
        )}
      >
        Start building
        <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
      <TerminalLink
        href="/quickstart"
        size="lg"
        className="flex-1 sm:flex-none"
        truncateLabel
      >
        curl dugble.com/send
      </TerminalLink>
    </div>
  );
}
