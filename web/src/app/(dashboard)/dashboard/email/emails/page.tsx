import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Inbox } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Emails"
      description="Outbox and compose."
      icon={Inbox}
    />
  );
}
