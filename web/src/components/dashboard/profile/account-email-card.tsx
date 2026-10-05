import { Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AccountEmailForm } from "./account-email-form";
import { SectionCardHeader } from "./section-card-header";

export function AccountEmailCard({
  email,
  emailVerified,
}: {
  email: string;
  emailVerified: boolean;
}) {
  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <SectionCardHeader
        icon={Mail}
        title="Email Address"
        description="Used to sign in, and for receipts and account notifications."
      />
      <AccountEmailForm email={email} emailVerified={emailVerified} />
    </Card>
  );
}
