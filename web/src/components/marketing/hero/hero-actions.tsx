import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { TerminalLink } from "../terminal-link";
import { cn } from "@/lib/utils";

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
                curl dugble.com/sen
            </TerminalLink>
        </div>
    );
}
