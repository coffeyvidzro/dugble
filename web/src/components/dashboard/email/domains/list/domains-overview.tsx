import { EmptyDomainsState } from "@/components/dashboard/email/domains/list/empty-domains-state";
import { AddDomainDialog } from "@/components/dashboard/email/domains/list/add-domain-dialog";
import { DomainsHeader } from "@/components/dashboard/email/domains/list/domains-header";
import { DomainsTable } from "@/components/dashboard/email/domains/list/domains-table";
import { listDomains } from "@/components/dashboard/email/domains/utils/store";

export async function DomainsOverview() {
    const domains = await listDomains();

    return (
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
    );
}
