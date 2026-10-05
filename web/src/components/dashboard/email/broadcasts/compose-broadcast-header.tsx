// src/components/dashboard/email/broadcasts/compose-broadcast-header.tsx

import { PenSquare } from "lucide-react";
import type { Broadcast } from "@/types/broadcast-api";
import { PortalHeroHeader } from "../../portal-hero-header";

export function ComposeBroadcastHeader({
  editingBroadcast,
}: {
  editingBroadcast: Broadcast | null;
}) {
  return (
    <PortalHeroHeader
      breadcrumb={
        editingBroadcast
          ? "Email > Broadcasts > Edit"
          : "Email > Broadcasts > New"
      }
      title={editingBroadcast ? "Edit Broadcast" : "New Broadcast"}
      description={
        editingBroadcast
          ? "Update your broadcast before it goes out."
          : "Compose a one-time send or schedule a campaign for later."
      }
      badge={
        <>
          <PenSquare className="size-3.5" />
          {editingBroadcast ? "Editing draft" : "Unsaved"}
        </>
      }
    />
  );
}
