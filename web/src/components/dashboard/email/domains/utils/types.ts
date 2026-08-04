export type DomainStatus = "verified" | "pending" | "failed";

export type DnsRecordType = "TXT" | "MX" | "CNAME";

export type DnsRecordPurpose =
    | "dkim"
    | "spf"
    | "mx"
    | "tracking-open"
    | "tracking-click";

export type DnsRecord = {
    id: string;
    purpose: DnsRecordPurpose;
    type: DnsRecordType;
    name: string;
    content: string;
    ttl: string;
    priority?: number;
    status: DomainStatus;
};

export type TrackingConfig = {
    metricsEnabled: boolean;
    clickTrackingEnabled: boolean;
    openTrackingEnabled: boolean;
};

export type SendingDomain = {
    id: string;
    domain: string;
    region: string;
    status: DomainStatus;
    receivingEnabled: boolean;
    createdAt: string;
    records: DnsRecord[];
    tracking: TrackingConfig;
};
