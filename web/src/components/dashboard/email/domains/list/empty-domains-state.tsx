import { Globe } from "lucide-react";

import { AddDomainDialog } from "./add-domain-dialog";

export function EmptyDomainsState() {
    return (
        <div className="animate-fade-up flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/50">
                <Globe className="size-5 text-muted-foreground" />
            </div>
            <h3 className="mb-1 font-heading text-lg font-medium">
                No domains added yet
            </h3>
            <p className="mb-5 max-w-sm text-sm text-muted-foreground">
                Add a domain you own to start sending and receiving
                transactional email from your own address instead of a shared
                one.
            </p>
            <AddDomainDialog />
        </div>
    );
}
