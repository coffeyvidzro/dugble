import { CopySectionLinkButton } from "./copy-section-link-button";
import { LegalBlockRenderer } from "./legal-block-renderer";
import type { LegalSectionData } from "./legal-types";

export function LegalSection({
    section,
    index,
}: {
    section: LegalSectionData;
    index: number;
}) {
    return (
        <section
            id={section.id}
            className="scroll-mt-(--legal-scroll-offset-mobile,7rem) space-y-4 border-b pb-10 last:border-0 last:pb-0 lg:scroll-mt-(--legal-scroll-offset-desktop,6rem)"
        >
            <div className="group flex items-center gap-1.5">
                <h2 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
                    <span className="mr-2 font-mono text-sm font-normal text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.title}
                </h2>
                <CopySectionLinkButton sectionId={section.id} />
            </div>
            <div className="space-y-4">
                <LegalBlockRenderer blocks={section.blocks} />
            </div>
        </section>
    );
}
