import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="SMS API"
      title="A2P SMS for OTPs, alerts, and customer notifications."
      description="Reach customers with developer-friendly SMS APIs for verification codes, reminders, account alerts, and product-critical messaging."
      code={`curl https://api.dugble.com/v1/messages/sms \
  -H "Authorization: Bearer dug_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"to":"+233501234567","template":"otp","data":{"code":"123456"}}' `}
      note={{
        title: "SMS for high-trust moments",
        description:
          "Built for messages where speed, clarity, and delivery visibility matter.",
      }}
      features={[
        {
          title: "OTP workflows",
          description:
            "Send verification codes for sign-up, login, checkout, and account recovery.",
        },
        {
          title: "A2P routing context",
          description:
            "Design SMS delivery around product notifications, not one-off campaigns.",
        },
        {
          title: "Delivery visibility",
          description:
            "Inspect queued, sent, delivered, failed, and provider-response states.",
        },
        {
          title: "Webhook events",
          description: "React to message updates from your own backend.",
        },
        {
          title: "Sender setup",
          description:
            "Prepare sender identities and routing rules for production traffic.",
        },
        {
          title: "Operational logs",
          description:
            "Give teams the audit trail they need when customers report missing messages.",
        },
      ]}
    />
  );
}
