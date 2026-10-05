import { SegmentsPage } from "@/components/dashboard/audience/segments/segments-page";
import { PrefetchBoundary } from "@/components/providers/prefetch-boundary";

export default function Page() {
  return (
    <PrefetchBoundary queries={["segments"]}>
      <SegmentsPage />
    </PrefetchBoundary>
  );
}
