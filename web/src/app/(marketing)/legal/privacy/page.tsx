import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Privacy"
      title="Privacy principles for customer messaging data."
      description="Dugble will handle account, workspace, recipient, and message-event data with clear product boundaries and operational safeguards."
      checklist={[
        "Collect only what messaging workflows need.",
        "Separate account, workspace, and message data.",
        "Protect credentials and operational logs.",
        "Use data to provide delivery visibility and support.",
      ]}
      note={{
        title: "Legal placeholder",
        description:
          "This first-pass page is product-oriented and should be reviewed by counsel before production launch.",
      }}
      features={[
        {
          title: "Account data",
          description: "Used to authenticate users and manage workspaces.",
        },
        {
          title: "Recipient data",
          description: "Used to process messages and delivery outcomes.",
        },
        {
          title: "Message data",
          description:
            "Used for logs, support, retries, and delivery visibility.",
        },
        {
          title: "Webhook data",
          description:
            "Used to deliver event payloads to configured endpoints.",
        },
        {
          title: "Retention planning",
          description: "Define retention windows for logs and event history.",
        },
        {
          title: "Security controls",
          description:
            "Protect access through sessions, API keys, and workspace boundaries.",
        },
      ]}
    />
  );
}
