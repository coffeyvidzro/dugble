import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Security"
      title="Security foundations for messaging infrastructure."
      description="Dugble is being designed around safe API access, webhook verification, session protection, and operational controls for customer communication."
      checklist={[
        "Server-side API keys for messaging requests.",
        "Webhook signatures for event verification.",
        "CSRF protection for unsafe dashboard actions.",
        "Session-aware authenticated dashboard routes.",
        "Future audit logs for team activity.",
      ]}
      note={{
        title: "Trust is part of delivery",
        description:
          "Messaging platforms need secure credentials and clear operational safeguards.",
      }}
      features={[
        {
          title: "API key hygiene",
          description:
            "Create and rotate keys without exposing server-side secrets to browsers.",
        },
        {
          title: "Webhook signatures",
          description: "Verify events before updating product state.",
        },
        {
          title: "CSRF-aware dashboard",
          description:
            "Protect unsafe browser requests with backend-issued tokens.",
        },
        {
          title: "Session protection",
          description:
            "Resolve dashboard access through authenticated server-side checks.",
        },
        {
          title: "Team controls",
          description:
            "Prepare workspace membership and role-based access for product teams.",
        },
        {
          title: "Auditability",
          description:
            "Build toward audit logs for keys, webhooks, senders, and settings.",
        },
      ]}
    />
  );
}
