import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Contact"
      title="Talk to Dugble about messaging infrastructure."
      description="Reach out for product feedback, early access, partnership conversations, support, or volume A2P messaging discussions."
      checklist={[
        "Early access and product feedback.",
        "Volume messaging conversations.",
        "Partnership and integration discussions.",
        "Support for account or onboarding questions.",
      ]}
      note={{
        title: "Let’s build with you",
        description:
          "The best product feedback comes from teams actively sending customer messages.",
      }}
      features={[
        {
          title: "Early access",
          description:
            "Join the first group of teams shaping Dugble workflows.",
        },
        {
          title: "Product feedback",
          description:
            "Tell us what your current messaging stack makes difficult.",
        },
        {
          title: "Volume planning",
          description: "Discuss OTP, notification, email, or SMS scale needs.",
        },
        {
          title: "Partnerships",
          description:
            "Explore integrations across product, delivery, or infrastructure.",
        },
        {
          title: "Support",
          description: "Get help with account, dashboard, or API questions.",
        },
        {
          title: "Roadmap input",
          description:
            "Help prioritize the messaging primitives that matter most.",
        },
      ]}
    />
  );
}
