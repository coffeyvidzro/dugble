import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Quickstart"
      title="Send your first Dugble message in minutes."
      description="Create a workspace, generate an API key, send a test email or SMS, configure a webhook, and inspect delivery logs from the dashboard."
      checklist={[
        "Create your Dugble account and workspace.",
        "Generate an API key for server-side requests.",
        "Send a test SMS or transactional email.",
        "Configure a webhook endpoint for delivery events.",
        "Open logs to inspect request IDs and message state.",
      ]}
      note={{
        title: "First integration path",
        description:
          "The quickstart focuses on the shortest path from account creation to a debuggable production-style message.",
      }}
      features={[
        {
          title: "1. Create workspace",
          description:
            "Keep API keys, logs, senders, and team access scoped to a workspace.",
        },
        {
          title: "2. Generate API key",
          description:
            "Use server-side keys for authenticated messaging API requests.",
        },
        {
          title: "3. Send test SMS",
          description:
            "Validate OTP and notification flows before real customer traffic.",
        },
        {
          title: "4. Send test email",
          description:
            "Confirm transactional email templates and payload data.",
        },
        {
          title: "5. Configure webhook",
          description:
            "Receive delivery updates and failure events in your backend.",
        },
        {
          title: "6. Inspect logs",
          description:
            "Use request IDs and status history to debug the full message lifecycle.",
        },
      ]}
    />
  );
}
