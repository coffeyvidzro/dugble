import type { ChangelogEntryData } from "./changelog-entry";

export const changelogEntries: ChangelogEntryData[] = [
    {
        date: "2026-07-18",
        tag: "New",
        title: "Idempotency keys for SMS sends",
        description:
            "Pass an idempotency_key on any SMS request so retried network calls never send a duplicate OTP.",
        code: `curl https://api.dugble.com/v1/messages \\
  -d channel="sms" -d to="+233531184325" \\
  -d idempotency_key="otp_7f2a9c"`,
    },
    {
        date: "2026-07-09",
        tag: "Improved",
        title: "Faster message logs",
        description:
            "Searching logs by message_id or recipient is noticeably faster on workspaces with high message volume.",
    },
    {
        date: "2026-07-02",
        tag: "Fixed",
        title: "Webhook retries firing early",
        description:
            "A timing bug occasionally queued a retry before the 2-second backoff had fully elapsed. Retry timing now matches the documented schedule.",
    },
    {
        date: "2026-06-24",
        tag: "New",
        title: "Email bounce classification",
        description:
            "Bounced emails now report a normalized reason: invalid_address, mailbox_full, or blocked instead of a raw provider code.",
        details: [
            "Included in the message.bounced webhook payload",
            "Visible directly in the message logs table",
        ],
    },
    {
        date: "2026-06-11",
        tag: "Improved",
        title: "Dashboard log search",
        description:
            "Log search now matches partial phone numbers and email addresses, not just exact strings.",
    },
    {
        date: "2026-05-29",
        tag: "New",
        title: "Workspace-level webhook signing keys",
        description:
            "Each workspace now gets its own signing key, so rotating a key in one workspace no longer affects others.",
    },
    {
        date: "2026-05-14",
        tag: "Fixed",
        title: "Sandbox messages appearing in production logs",
        description:
            "Sandbox test sends were briefly visible in the production log view for workspaces created before April. Log scoping is now consistent for every workspace.",
    },
    {
        date: "2026-05-02",
        tag: "New",
        title: "Template data validation",
        description:
            "Sends with a template now fail fast with a clear error if required template_data fields are missing, instead of sending a partially-rendered message.",
    },
];
