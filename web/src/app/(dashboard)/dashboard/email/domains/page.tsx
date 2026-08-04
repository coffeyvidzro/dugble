import { AddDomainDialog } from "@/components/dashboard/email/domains/list/add-domain-dialog";
import { DomainsHeader } from "@/components/dashboard/email/domains/list/domains-header";
import { DomainsTable } from "@/components/dashboard/email/domains/list/domains-table";
import { EmptyDomainsState } from "@/components/dashboard/email/domains/list/empty-domains-state";
import { listDomains } from "@/components/dashboard/email/domains/utils/store";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Email Domains",
    description: "Manage sending domains for transactional email.",
    path: "/dashboard/email/domains",
    preset: "dashboard",
});

export default async function Page() {
    const domains = await listDomains();

    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-2">
            <div className="mx-auto w-full max-w-6xl pb-6">
                <DomainsHeader domains={domains} />

                <div className="space-y-6">
                    <div
                        className="animate-fade-up flex flex-wrap items-center justify-between gap-3"
                        style={{
                            animationDelay: "100ms",
                            animationFillMode: "both",
                        }}
                    >
                        <p className="text-sm text-muted-foreground">
                            {domains.length === 0
                                ? "Add your first sending domain to get started."
                                : `${domains.length} domain${domains.length === 1 ? "" : "s"} connected to your workspace.`}
                        </p>
                        {domains.length > 0 && <AddDomainDialog />}
                    </div>

                    <div
                        className="animate-fade-up"
                        style={{
                            animationDelay: "150ms",
                            animationFillMode: "both",
                        }}
                    >
                        {domains.length === 0 ? (
                            <EmptyDomainsState />
                        ) : (
                            <DomainsTable domains={domains} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
