import { Mail } from "lucide-react";

import { SectionCardHeader } from "./section-card-header";
import { AccountEmailForm } from "./account-email-form";
import { Card } from "@/components/ui/card";

export function AccountEmailCard({ initialEmail }: { initialEmail: string }) {
    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Mail}
                title="Email Address"
                description="Used to sign in, and for receipts and account notifications."
            />
            <AccountEmailForm initialEmail={initialEmail} />
        </Card>
    );
}
