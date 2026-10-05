import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DeleteAccountPanel } from "./delete-account-panel";
import { SectionCardHeader } from "./section-card-header";

export function DeleteAccountCard({ currentEmail }: { currentEmail: string }) {
  return (
    <Card className="border-danger/30 bg-danger/5 shadow-sm transition-colors hover:border-danger/50">
      <SectionCardHeader
        icon={AlertTriangle}
        title="Delete Account"
        description="Permanently delete your Dugble account and profile."
        tone="danger"
      />
      <DeleteAccountPanel currentEmail={currentEmail} />
    </Card>
  );
}
