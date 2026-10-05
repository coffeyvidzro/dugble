// src/components/dashboard/audience/shared/list-status.tsx

import { Card } from "@/components/ui/card";

export function ListLoadingState({ label }: { label: string }) {
  return (
    <Card className="border-border/40 shadow-sm">
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        {label}
      </div>
    </Card>
  );
}

export function ListErrorState({ label }: { label: string }) {
  return (
    <Card className="border-border/40 shadow-sm">
      <div className="flex items-center justify-center py-16 text-sm text-danger">
        {label}
      </div>
    </Card>
  );
}
