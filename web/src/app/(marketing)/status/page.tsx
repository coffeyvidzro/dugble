import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Status"
      title="Platform availability for Dugble services."
      description="Track the planned health surface for Dugble APIs, dashboard, email, SMS, webhooks, and delivery event processing."
      checklist={[
        "API availability.",
        "Dashboard availability.",
        "Email and SMS delivery systems.",
        "Webhook delivery processing.",
        "Incident communication and history.",
      ]}
      note={{
        title: "Status page placeholder",
        description:
          "A public status page will make platform health and incident communication easier to follow.",
      }}
      features={[
        {
          title: "API health",
          description: "Expose availability for core API requests.",
        },
        {
          title: "Dashboard health",
          description:
            "Track access to workspace, logs, and settings surfaces.",
        },
        {
          title: "Email systems",
          description: "Report transactional email processing state.",
        },
        {
          title: "SMS systems",
          description: "Report A2P SMS processing and delivery state.",
        },
        {
          title: "Webhook delivery",
          description: "Track event fanout and retry systems.",
        },
        {
          title: "Incident history",
          description:
            "Keep customers informed during degraded service windows.",
        },
      ]}
    />
  );
}
