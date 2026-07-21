import { FocusedMarketingPage } from "@/components/marketing/focused-marketing-page";

export default function Page() {
  return (
    <FocusedMarketingPage
      eyebrow="Terms"
      title="Terms for using Dugble APIs and dashboard."
      description="These first-pass terms describe the expected use of Dugble accounts, APIs, messaging workflows, and operational responsibilities."
      checklist={[
        "Use APIs for lawful A2P messaging.",
        "Keep API keys secure and server-side.",
        "Respect recipient consent and applicable messaging rules.",
        "Monitor delivery logs and webhook outcomes.",
      ]}
      note={{
        title: "Legal placeholder",
        description:
          "This page is a product draft and should be replaced with counsel-reviewed terms before launch.",
      }}
      features={[
        {
          title: "Account responsibility",
          description:
            "Teams are responsible for users, workspaces, and credentials.",
        },
        {
          title: "API usage",
          description:
            "Messaging APIs should be used for legitimate product communication.",
        },
        {
          title: "Recipient rules",
          description:
            "Customers must follow applicable consent and messaging requirements.",
        },
        {
          title: "Service changes",
          description:
            "Dugble may improve APIs, limits, routes, and dashboard features.",
        },
        {
          title: "Operational limits",
          description:
            "Rate limits and safeguards protect platform reliability.",
        },
        {
          title: "Support path",
          description:
            "Contact Dugble for questions about usage, compliance, or incidents.",
        },
      ]}
    />
  );
}
