import type {
    DnsRecord,
    DnsRecordPurpose,
    DomainStatus,
    SendingDomain,
} from "./types";

export function getRecordsByPurpose(
    domain: SendingDomain,
    ...purposes: DnsRecordPurpose[]
): DnsRecord[] {
    return domain.records.filter((record) => purposes.includes(record.purpose));
}

// A domain is only "verified" once its required records (DKIM and SPF) are verified.

export function deriveDomainStatus(records: DnsRecord[]): DomainStatus {
    const required = records.filter(
        (record) => record.purpose === "dkim" || record.purpose === "spf",
    );
    if (required.some((record) => record.status === "failed")) return "failed";
    if (
        required.length > 0 &&
        required.every((record) => record.status === "verified")
    )
        return "verified";
    return "pending";
}

export function formatDomainDate(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(iso));
}
