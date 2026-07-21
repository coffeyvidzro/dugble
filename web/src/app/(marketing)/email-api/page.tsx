import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Email API"
      title="Transactional email that developers can operate confidently."
      description="Send receipts, alerts, password resets, onboarding emails, and lifecycle notifications with clean APIs and delivery events built for production teams."
      code={`curl https://api.dugble.com/v1/messages/email \
  -H "Authorization: Bearer dug_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"to":"customer@example.com","template":"receipt","data":{"order_id":"DGB-1001"}}' `}
      note={{
        title: "Email for product workflows",
        description:
          "Use email for receipts, account updates, onboarding, and customer lifecycle messages.",
      }}
      features={[
        {
          title: "Transactional delivery",
          description:
            "Send product-triggered email through a predictable API surface.",
        },
        {
          title: "Templates and variables",
          description:
            "Pass structured data into reusable templates as the product matures.",
        },
        {
          title: "Delivery events",
          description:
            "Track sent, delivered, bounced, and failed states through logs and webhooks.",
        },
        {
          title: "Developer debugging",
          description:
            "Use request IDs and provider feedback to debug customer issues faster.",
        },
        {
          title: "Safe retries",
          description:
            "Design workflows with idempotency and clear status transitions.",
        },
        {
          title: "Dashboard visibility",
          description:
            "Give support and engineering teams a shared view of message outcomes.",
        },
      ]}
    />
  );
}
