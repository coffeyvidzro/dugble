import type {
    DnsRecord,
    DnsRecordPurpose,
    DnsRecordType,
    DomainStatus,
} from "./types";

const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

// Stand-in for a real ID generator
export function createId(): string {
    let id = "c";
    for (let i = 0; i < 24; i++) {
        id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
    }
    return id;
}

function buildRecord(
    purpose: DnsRecordPurpose,
    type: DnsRecordType,
    name: string,
    content: string,
    status: DomainStatus,
    priority?: number,
): DnsRecord {
    return {
        id: createId(),
        purpose,
        type,
        name,
        content,
        ttl: "Auto",
        status,
        priority,
    };
}

export function buildDomainRecords(
    domain: string,
    status: DomainStatus = "pending",
): DnsRecord[] {
    return [
        buildRecord(
            "dkim",
            "TXT",
            "dugble._domainkey",
            "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7VJTUt9Us8cKj",
            status,
        ),
        buildRecord(
            "spf",
            "TXT",
            "@",
            "v=spf1 include:spf.dugble.com ~all",
            status,
        ),
        buildRecord("mx", "MX", "@", "mx.dugble.com", status, 10),
        buildRecord(
            "tracking-open",
            "CNAME",
            "track",
            "open.dugble.link",
            status,
        ),
        buildRecord(
            "tracking-click",
            "CNAME",
            "click",
            "click.dugble.link",
            status,
        ),
    ];
}
