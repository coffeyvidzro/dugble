import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
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
            <Link
                href="/quickstart"
                className="group/button relative inline-flex h-11 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/20 sm:flex-none"
            >
                <span className="text-signal">$</span>
                <span className="truncate">curl dugble.com/send</span>
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
            </Link>
        </div>
    );
}
