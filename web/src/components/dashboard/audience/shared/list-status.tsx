import {
  ErrorState,
  TableSkeleton,
} from "@/components/dashboard/shared/data-states";
import { Card } from "@/components/ui/card";

export function ListLoadingState({ label }: { label: string }) {
  return (
    <Card className="gap-0 py-0">
      <span className="sr-only">{label}</span>
      <TableSkeleton rows={6} />
    </Card>
  );
}

export function ListErrorState({ label }: { label: string }) {
  return (
    <Card className="gap-0 py-0">
      <ErrorState title={label} />
    </Card>
  );
}
