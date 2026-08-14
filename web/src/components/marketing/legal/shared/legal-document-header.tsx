import type { LegalDocumentMeta } from "./legal-types";

export function LegalDocumentHeader({ meta }: { meta: LegalDocumentMeta }) {
    return (
        <header className="max-w-2xl space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                {meta.eyebrow}
            </p>
            <h1 className="text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">
                {meta.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                <span className="rounded-full border bg-card/60 px-3 py-1">
                    Effective {meta.effectiveDate}
                </span>
                <span className="rounded-full border bg-card/60 px-3 py-1">
                    Last updated {meta.lastUpdated}
                </span>
            </div>
            <p className="text-pretty text-lg leading-8 text-muted-foreground">
                {meta.intro}
            </p>
        </header>
    );
}
