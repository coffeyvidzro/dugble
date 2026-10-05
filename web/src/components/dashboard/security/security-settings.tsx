import { ChangePasswordCard } from "./change-password-card";
import { SecurityHeader } from "./security-header";
import { SessionsCard } from "./sessions-card";
import { TwoFactorCard } from "./two-factor-card";

export function SecuritySettings() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-8">
      <SecurityHeader />
      <ChangePasswordCard />
      <TwoFactorCard />
      <SessionsCard />
    </div>
  );
}
