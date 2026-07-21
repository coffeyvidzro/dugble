import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Webhooks"
      title="Delivery events your application can trust."
      description="Receive message status updates, failures, retries, and delivery events so your product can react to every A2P notification lifecycle."
      code={`{
  "type": "message.delivered",
  "message_id": "msg_01J...",
  "channel": "sms",
  "recipient": "+233501234567",
  "delivered_at": "2026-07-21T12:00:00Z"
}`}
      note={{
        title: "Event-driven messaging",
        description:
          "Webhooks turn delivery state into product logic instead of dashboard-only visibility.",
      }}
      features={[
        {
          title: "Delivery events",
          description:
            "Receive sent, delivered, failed, bounced, and retried states.",
        },
        {
          title: "Signature verification",
          description: "Verify webhook payloads before trusting event data.",
        },
        {
          title: "Retry behavior",
          description:
            "Handle temporary endpoint failures without losing important events.",
        },
        {
          title: "Event history",
          description:
            "Inspect delivery attempts and payloads from the dashboard.",
        },
        {
          title: "Local testing",
          description:
            "Use test-mode events to validate integrations before production.",
        },
        {
          title: "Clear payloads",
          description:
            "Keep webhook objects predictable and easy to map into your systems.",
        },
      ]}
    />
  );
}
