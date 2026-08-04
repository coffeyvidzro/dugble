import { buildDomainRecords, createId } from "./mock-data";
import { deriveDomainStatus } from "./selectors";
import type { SendingDomain, TrackingConfig } from "./types";

let domains: SendingDomain[] = [
    {
        id: "cln1verifieddomain0001aa",
        domain: "notify.dugble.com",
        region: "Global",
        receivingEnabled: true,
        createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 62,
        ).toISOString(),
        records: buildDomainRecords("notify.dugble.com", "verified"),
        tracking: {
            metricsEnabled: true,
            clickTrackingEnabled: true,
            openTrackingEnabled: true,
        },
        status: "verified",
    },
    {
        id: "cln2verifieddomain0002bb",
        domain: "receipts.dugble.com",
        region: "Global",
        receivingEnabled: false,
        createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 40,
        ).toISOString(),
        records: buildDomainRecords("receipts.dugble.com", "verified"),
        tracking: {
            metricsEnabled: false,
            clickTrackingEnabled: false,
            openTrackingEnabled: false,
        },
        status: "verified",
    },
    {
        id: "cmsd80xrk0a2c9okxkeatmqly",
        domain: "updates.kessie.dev",
        region: "Global",
        receivingEnabled: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        records: buildDomainRecords("updates.kessie.dev", "pending"),
        tracking: {
            metricsEnabled: false,
            clickTrackingEnabled: false,
            openTrackingEnabled: false,
        },
        status: "pending",
    },
].map((seed) => ({ ...seed, status: deriveDomainStatus(seed.records) }));

export async function listDomains(): Promise<SendingDomain[]> {
    return domains;
}

export async function getDomainById(
    id: string,
): Promise<SendingDomain | undefined> {
    return domains.find((domain) => domain.id === id);
}

export function createDomain(
    domainName: string,
    region = "Global",
): SendingDomain {
    const records = buildDomainRecords(domainName, "pending");
    const created: SendingDomain = {
        id: createId(),
        domain: domainName,
        region,
        receivingEnabled: false,
        createdAt: new Date().toISOString(),
        records,
        tracking: {
            metricsEnabled: false,
            clickTrackingEnabled: false,
            openTrackingEnabled: false,
        },
        status: deriveDomainStatus(records),
    };
    domains = [created, ...domains];
    return created;
}

export function deleteDomain(id: string): void {
    domains = domains.filter((domain) => domain.id !== id);
}

// Simulates a DNS propagation check: every pending record resolves to verified.
// I'll make it persistent later 👌
export function verifyDomain(id: string): void {
    domains = domains.map((domain) => {
        if (domain.id !== id) return domain;
        const records = domain.records.map((record) =>
            record.status === "pending"
                ? { ...record, status: "verified" as const }
                : record,
        );
        return { ...domain, records, status: deriveDomainStatus(records) };
    });
}

export function setReceivingEnabled(id: string, enabled: boolean): void {
    domains = domains.map((domain) =>
        domain.id === id ? { ...domain, receivingEnabled: enabled } : domain,
    );
}

export function updateTrackingConfig(
    id: string,
    patch: Partial<TrackingConfig>,
): void {
    domains = domains.map((domain) =>
        domain.id === id
            ? { ...domain, tracking: { ...domain.tracking, ...patch } }
            : domain,
    );
}
