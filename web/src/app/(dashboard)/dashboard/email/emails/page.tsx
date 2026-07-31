import { Inbox } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Send Email",
  description: "Send a transactional email from your Dugble workspace.",
  path: "/dashboard/email/emails",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Emails"
      description="Outbox and compose."
      icon={Inbox}
    />
  );
}
