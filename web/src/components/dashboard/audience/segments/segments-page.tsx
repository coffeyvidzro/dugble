import { AudiencePageShell } from "../shared/audience-page-shell";
import { SegmentsHeader } from "./segments-header";
import { SegmentsList } from "./segments-list";

export function SegmentsPage() {
  return (
    <AudiencePageShell header={<SegmentsHeader />}>
      <SegmentsList />
    </AudiencePageShell>
  );
}
