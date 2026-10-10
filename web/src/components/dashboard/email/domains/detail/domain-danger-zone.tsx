import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SenderDomain } from "@/types/sender-domain-api";
import { DeleteDomainButton } from "./delete-domain-button";

export function DomainDangerZone({ domain }: { domain: SenderDomain }) {
  return (
    <Card className="border-red-200 bg-red-50/50 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-red-600 dark:text-red-500">
            Danger zone
          </CardTitle>
          <CardDescription>
            Disabling this domain immediately stops sending email from{" "}
            {domain.name}.
          </CardDescription>
        </div>
        <DeleteDomainButton domainId={domain.id} domainName={domain.name} />
      </CardHeader>
    </Card>
  );
}
