import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="About Dugble"
      title="Developer-first A2P messaging for teams building customer trust."
      description="Dugble is focused on the infrastructure layer behind OTPs, alerts, receipts, delivery updates, and other product-critical customer messages."
      checklist={[
        "Built around developer experience.",
        "Focused on A2P email and SMS workflows.",
        "Designed for observability and clear debugging.",
        "Shaped for teams building in African markets.",
      ]}
      note={{
        title: "Why Dugble exists",
        description:
          "Customer messages are part of the product experience, and developers need better tools to operate them.",
      }}
      features={[
        {
          title: "Developer experience",
          description: "Make APIs, errors, logs, and webhooks predictable.",
        },
        {
          title: "A2P focus",
          description:
            "Prioritize product-triggered communication over generic messaging.",
        },
        {
          title: "Operational clarity",
          description: "Help teams understand what happened to every message.",
        },
        {
          title: "Local context",
          description:
            "Design around sender identity, routing, and customer expectations.",
        },
        {
          title: "Trust moments",
          description:
            "Support OTPs, receipts, alerts, and lifecycle notifications.",
        },
        {
          title: "Platform path",
          description:
            "Grow from messaging primitives into a broader CPaaS surface.",
        },
      ]}
    />
  );
}
