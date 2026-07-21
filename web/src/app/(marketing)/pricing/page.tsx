import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Pricing"
      title="Simple pricing for developer-first A2P messaging."
      description="Start with test-mode workflows and move into pay-as-you-go email and SMS pricing when your product is ready for production traffic."
      checklist={[
        "Sandbox-friendly setup while integrating.",
        "Separate usage views for email and SMS.",
        "Volume conversations for growing teams.",
        "Transparent logs for every billable message.",
      ]}
      note={{
        title: "Pricing will stay predictable",
        description:
          "Dugble pricing should map to the channels and delivery outcomes teams actually operate.",
      }}
      features={[
        {
          title: "Sandbox first",
          description:
            "Build and test message flows before committing production traffic.",
        },
        {
          title: "Pay as you grow",
          description:
            "Scale email and SMS usage as customer notifications increase.",
        },
        {
          title: "Channel clarity",
          description: "Understand email and SMS usage separately.",
        },
        {
          title: "Volume support",
          description: "Talk to the team for high-volume A2P traffic.",
        },
        {
          title: "Operational visibility",
          description:
            "Use logs and status history to understand what was sent.",
        },
        {
          title: "No surprise surface area",
          description: "Keep pricing aligned to real messaging primitives.",
        },
      ]}
    />
  );
}
