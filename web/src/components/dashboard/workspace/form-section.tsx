import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function FormSection({
    title,
    description,
    icon: Icon,
    delay = 0,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    delay?: number;
    children: ReactNode;
}) {
    return (
        <section
            style={{ animationDelay: `${delay}s` } as CSSProperties}
            className="group animate-fade-up relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition-colors duration-300 focus-within:border-signal/40 hover:border-foreground/15"
        >
            <div
                className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-signal/6 opacity-0 blur-3xl transition-opacity duration-500 group-focus-within:opacity-100"
                aria-hidden
            />

            <div className="relative flex items-start gap-3 border-b border-border/60 px-4 py-4 sm:gap-3.5 sm:px-6 sm:py-5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors duration-300 group-focus-within:border-signal/30 group-focus-within:text-signal sm:size-9">
                    <Icon className="size-4" />
                </div>
                <div className="space-y-1 pt-0.5">
                    <h2 className="font-heading text-[15px] font-semibold tracking-tight sm:text-base">
                        {title}
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <div className="relative p-4 sm:p-6">{children}</div>
        </section>
    );
}
