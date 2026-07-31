import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { ShieldCheck } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Security"
      description="Password, 2FA, and account security."
      icon={ShieldCheck}
    />
  );
}
