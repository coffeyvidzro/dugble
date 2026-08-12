import { CapabilitiesGrid } from "@/components/marketing/custom-solutions/capabilities-grid";
import { sectionNavItems } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { CustomSolutionsHero } from "@/components/marketing/custom-solutions/custom-solutions-hero";
import { EngagementModels } from "@/components/marketing/custom-solutions/engagement-models";
import { EngagementProcess } from "@/components/marketing/custom-solutions/engagement-process";
import { FaqSection } from "@/components/marketing/custom-solutions/faq-section";
import { FitComparison } from "@/components/marketing/custom-solutions/fit-comparison";
import { IncludedChecklist } from "@/components/marketing/custom-solutions/included-checklist";
import { RequestSection } from "@/components/marketing/custom-solutions/request-section";
import { SecurityNote } from "@/components/marketing/custom-solutions/security-note";
import { SectionNav } from "@/components/marketing/custom-solutions/section-nav";
import { TechnicalExample } from "@/components/marketing/custom-solutions/technical-example";
import { UseCases } from "@/components/marketing/custom-solutions/use-cases";
import { WhoItsFor } from "@/components/marketing/custom-solutions/who-its-for";
import { Separator } from "@/components/ui/separator";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Custom Solutions",
    description:
        "Dedicated infrastructure, custom integrations, and compliance support for teams the standard Dugble API doesn't fully cover.",
    path: "/custom-solutions",
});

export default function Page() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
                <CustomSolutionsHero />
                <SectionNav items={sectionNavItems} />
                <WhoItsFor />
                <Separator />
                <CapabilitiesGrid />
                <IncludedChecklist />
                <FitComparison />
                <EngagementModels />
                <EngagementProcess />
                <UseCases />
                <TechnicalExample />
                <SecurityNote />
                <FaqSection />
                <RequestSection />
            </div>
        </main>
    );
}
