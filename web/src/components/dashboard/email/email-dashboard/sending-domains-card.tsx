import Link from "next/link";

import { ArrowRight } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SendingDomain } from "./types";

const STATUS_DOT: Record<SendingDomain["status"], string> = {
    verified: "bg-signal",
    pending: "bg-pending",
    failed: "bg-danger",
};

const STATUS_LABEL: Record<SendingDomain["status"], string> = {
    verified: "Verified",
    pending: "Pending DNS",
    failed: "Failed",
};

export function SendingDomainsCard({ domains }: { domains: SendingDomain[] }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-xl">Sending Domains</CardTitle>
                    <CardDescription>
                        Domains verified to send on your behalf.
                    </CardDescription>
                </div>
                <Link
                    href="/dashboard/email/domains"
                    className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                >
                    Manage domains
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Link>
            </CardHeader>

            <div className="flex flex-wrap gap-2.5 p-4">
                {domains.length === 0 ? (
                    <p className="w-full py-6 text-center text-sm text-muted-foreground">
                        No domains added yet.
                    </p>
                ) : (
                    domains.map((domain) => (
                        <div
                            key={domain.id}
                            className="inline-flex items-center gap-2.5 rounded-lg border border-border/40 px-3 py-2"
                        >
                            <span
                                className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    STATUS_DOT[domain.status],
                                )}
                            />
                            <span className="font-mono text-xs text-foreground">
                                {domain.domain}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {STATUS_LABEL[domain.status]}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
