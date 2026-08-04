import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfigurationSection } from "@/components/dashboard/email/domains/detail/configuration-section";
import { DnsRecordsSection } from "@/components/dashboard/email/domains/detail/dns-records-section";
import { DomainDangerZone } from "@/components/dashboard/email/domains/detail/domain-danger-zone";
import { DomainDetailHeader } from "@/components/dashboard/email/domains/detail/domain-detail-header";
import { getDomainById } from "@/components/dashboard/email/domains/utils/store";
import { constructMetadata } from "@/utils/metadata";

type PageParams = { id: string };

export async function generateMetadata({
    params,
}: {
    params: Promise<PageParams>;
}): Promise<Metadata> {
    const { id } = await params;
    const domain = await getDomainById(id);

    return constructMetadata({
        title: domain ? `${domain.domain} · Domains` : "Domain not found",
        description:
            "DNS configuration for a transactional email sending domain.",
        path: `/dashboard/email/domains/${id}`,
        preset: "dashboard",
    });
}

export default async function Page({
    params,
}: {
    params: Promise<PageParams>;
}) {
    const { id } = await params;
    const domain = await getDomainById(id);

    if (!domain) {
        notFound();
    }

    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-2">
            <div className="mx-auto w-full max-w-6xl pb-6">
                <DomainDetailHeader domain={domain} />

                <div
                    className="animate-fade-up space-y-6"
                    style={{
                        animationDelay: "100ms",
                        animationFillMode: "both",
                    }}
                >
                    <DnsRecordsSection domain={domain} />
                    <ConfigurationSection domain={domain} />
                    <DomainDangerZone domain={domain} />
                </div>
            </div>
        </div>
    );
}
