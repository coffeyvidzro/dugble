import { AudiencePageShell } from "../shared/audience-page-shell";
import { SuppressionsHeader } from "./suppressions-header";
import { SuppressionsList } from "./suppressions-list";

export function SuppressionsPage() {
  return (
    <AudiencePageShell header={<SuppressionsHeader />}>
      <SuppressionsList />
    </AudiencePageShell>
  );
}
