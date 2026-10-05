// src/components/dashboard/email/emails-page/detail/email-detail-header.tsx

import { CopyButton } from "@/components/dashboard/shared/copy-button";
import type { EmailApiResource } from "@/types/email-api";
import { EmailStatusBadge } from "../../shared/email-status-badge";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function EmailDetailHeader({ email }: { email: EmailApiResource }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <h1 className="truncate font-heading text-xl font-semibold text-foreground">
          {email.subject}
        </h1>
        <p className="text-sm text-muted-foreground">
          To{" "}
          <span className="font-medium text-foreground">
            {email.to.join(", ")}
          </span>
          {" · From "}
          <span className="font-medium text-foreground">{email.from}</span>
        </p>
        <div className="pt-1">
          <EmailStatusBadge status={email.last_event} />
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5">
          <span className="font-mono text-xs text-muted-foreground">
            {email.id}
          </span>
          <CopyButton value={email.id} label="email ID" />
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(email.created_at)}
        </p>
      </div>
    </div>
  );
}
