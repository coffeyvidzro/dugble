import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG, type TemplateCategory } from "./types";

export function TemplatePreviewThumbnail({
    category,
}: {
    category: TemplateCategory;
}) {
    const { colorClass } = CATEGORY_CONFIG[category];

    return (
        <div
            className={cn(
                "relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-muted/20",
                colorClass,
            )}
        >
            <svg
                viewBox="0 0 240 135"
                className="h-full w-full"
                aria-hidden="true"
            >
                <rect
                    x="0"
                    y="0"
                    width="240"
                    height="26"
                    className="fill-current opacity-90"
                />
                <circle cx="15" cy="13" r="5" className="fill-background" />
                <rect
                    x="28"
                    y="9.5"
                    width="56"
                    height="7"
                    rx="3.5"
                    className="fill-background/80"
                />
                <rect
                    x="16"
                    y="42"
                    width="140"
                    height="9"
                    rx="4"
                    className="fill-current opacity-80"
                />
                <rect
                    x="16"
                    y="58"
                    width="208"
                    height="5"
                    rx="2.5"
                    className="fill-foreground/15"
                />
                <rect
                    x="16"
                    y="68"
                    width="208"
                    height="5"
                    rx="2.5"
                    className="fill-foreground/15"
                />
                <rect
                    x="16"
                    y="78"
                    width="148"
                    height="5"
                    rx="2.5"
                    className="fill-foreground/15"
                />
                <rect
                    x="16"
                    y="96"
                    width="72"
                    height="20"
                    rx="10"
                    className="fill-current opacity-90"
                />
                <rect
                    x="30"
                    y="103"
                    width="44"
                    height="6"
                    rx="3"
                    className="fill-background/90"
                />
            </svg>
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
            />
        </div>
    );
}
