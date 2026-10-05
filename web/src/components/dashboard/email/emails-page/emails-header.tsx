// src/components/dashboard/email/emails-page/emails-header.tsx

import { Inbox } from "lucide-react";
import Link from "next/link";
import { PortalHeroHeader } from "../../portal-hero-header";

export function EmailsHeader() {
  return (
    <PortalHeroHeader
      breadcrumb={
        <>
          <Link
            href="/dashboard/email"
            className="transition-colors hover:text-foreground"
          >
            Email
          </Link>
          {" > Emails"}
        </>
      }
      title="Emails"
      description="Every transactional email sent from your workspace, searchable and traceable."
      badge={
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-signal" />
          </span>
          <Inbox className="size-3.5" />
          Live
        </>
      }
    />
  );
}
