import { Reveal } from "@/components/marketing/reveal";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

const assets = [
    { name: "Mark - dark background", file: "mark-dark-bg.svg" },
    { name: "Mark - light background", file: "mark-light-bg.svg" },
    { name: "Wordmark - dark background", file: "wordmark-dark-bg.svg" },
    { name: "Wordmark - light background", file: "wordmark-light-bg.svg" },
    { name: "Lockup - dark background", file: "lockup-dark-bg.svg" },
    { name: "Lockup - light background", file: "lockup-light-bg.svg" },
];

export function AssetDownloads() {
    return (
        <section id="assets" className="scroll-mt-24 space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Downloads
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Every file, as SVG.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Vector, so it scales cleanly from a favicon to a conference
                    banner. Need PNG or a different format? Email us and we'll
                    send it over.
                </p>
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2">
                {assets.map((asset, i) => (
                    <Reveal key={asset.file} delay={(i % 2) * 60}>
                        <a
                            href={`/brand/${asset.file}`}
                            download
                            className="group flex items-center justify-between gap-3 rounded-xl border bg-card/60 p-4 transition-colors hover:border-signal/40"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex size-9 items-center justify-center rounded-lg border",
                                        asset.file.includes("light-bg")
                                            ? "bg-white"
                                            : "bg-[#09090B]",
                                    )}
                                >
                                    <img
                                        src={`/brand/${asset.file}`}
                                        alt=""
                                        aria-hidden
                                        className="h-4 w-auto"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {asset.name}
                                    </p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        SVG
                                    </p>
                                </div>
                            </div>
                            <Download className="size-4 text-muted-foreground transition-colors group-hover:text-signal" />
                        </a>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
