import type { LegalBlock } from "./legal-types";

export function LegalBlockRenderer({ blocks }: { blocks: LegalBlock[] }) {
    return (
        <>
            {blocks.map((block, i) => {
                switch (block.type) {
                    case "paragraph":
                        return (
                            <p
                                key={i}
                                className="leading-7 text-muted-foreground"
                            >
                                {block.text}
                            </p>
                        );

                    case "subheading":
                        return (
                            <h3
                                key={i}
                                className="pt-2 font-heading text-base font-semibold tracking-tight text-foreground"
                            >
                                {block.text}
                            </h3>
                        );

                    case "list":
                        return (
                            <ul
                                key={i}
                                className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground marker:text-signal"
                            >
                                {block.items.map((item, j) => (
                                    <li key={j}>{item}</li>
                                ))}
                            </ul>
                        );

                    case "definitionList":
                        return (
                            <dl
                                key={i}
                                className="space-y-3 rounded-xl border bg-card/40 p-4"
                            >
                                {block.items.map((entry) => (
                                    <div
                                        key={entry.term}
                                        className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-4"
                                    >
                                        <dt className="font-mono text-xs uppercase tracking-wide text-signal">
                                            {entry.term}
                                        </dt>
                                        <dd className="text-sm leading-6 text-muted-foreground">
                                            {entry.definition}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        );

                    default:
                        return null;
                }
            })}
        </>
    );
}
