import { KeyRound } from "lucide-react";
import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";

export function ChangePasswordCard() {
  return (
    <Card className="overflow-hidden">
      <SectionCardHeader
        icon={KeyRound}
        title="Password"
        description="Choose a strong password you don't use anywhere else."
      />
      <ChangePasswordForm />
    </Card>
  );
}
