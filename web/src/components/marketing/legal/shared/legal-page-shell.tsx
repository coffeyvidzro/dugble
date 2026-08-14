import { LegalContactFooter } from "./legal-contact-footer";
import { LegalDocumentHeader } from "./legal-document-header";
import { LegalSummaryCard } from "./legal-summary-card";
import { LegalSectionNav } from "./legal-section-nav";
import { LegalSection } from "./legal-section";
import type { LegalDocumentMeta, LegalSectionData } from "./legal-types";
import { Reveal } from "@/components/marketing/reveal";

export function LegalPageShell({
    meta,
    sections,
}: {
    meta: LegalDocumentMeta;
    sections: LegalSectionData[];
}) {
    const navSections = sections.map((section) => ({
        id: section.id,
        title: section.title,
    }));

    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 lg:px-8">
                <Reveal>
                    <LegalDocumentHeader meta={meta} />
                </Reveal>

                <Reveal delay={80}>
                    <LegalSummaryCard points={meta.summaryPoints} />
                </Reveal>

                <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
                    <LegalSectionNav sections={navSections} />

                    <div className="min-w-0 space-y-10">
                        {sections.map((section, i) => (
                            <LegalSection
                                key={section.id}
                                section={section}
                                index={i}
                            />
                        ))}
                        <LegalContactFooter />
                    </div>
                </div>
            </div>
        </main>
    );
}
