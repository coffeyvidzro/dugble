import { Reveal } from "@/components/marketing/reveal";
import { ColorSwatch } from "./color-swatch";

const colors = [
    {
        name: "Background",
        hex: "#09090B",
        usage: "Page background",
        swatchClassName: "bg-background",
    },
    {
        name: "Foreground",
        hex: "#F4F4F6",
        usage: "Primary text",
        swatchClassName: "bg-foreground",
    },
    {
        name: "Muted foreground",
        hex: "#98989F",
        usage: "Secondary text",
        swatchClassName: "bg-muted-foreground",
    },
    {
        name: "Signal",
        hex: "#3ED98E",
        usage: "Delivered, success, active state",
        swatchClassName: "bg-signal",
    },
    {
        name: "Pending",
        hex: "#FFB454",
        usage: "Queued, in-flight",
        swatchClassName: "bg-pending",
    },
    {
        name: "Danger",
        hex: "#FF6B6B",
        usage: "Failed, bounced, error",
        swatchClassName: "bg-danger",
    },
];

export function ColorPalette() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Color
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Every color means something.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Signal, pending, and danger aren't decoration they're the
                    same three states used across every status pill, log entry,
                    and webhook event in the product. Reuse them that way, not
                    as a general-purpose accent palette.
                </p>
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {colors.map((color) => (
                    <ColorSwatch key={color.name} {...color} />
                ))}
            </div>
        </section>
    );
}
