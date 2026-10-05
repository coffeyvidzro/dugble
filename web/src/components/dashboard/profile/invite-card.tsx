"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useAcceptInvitation,
  useDeclineInvitation,
} from "@/hooks/queries/use-my-invitations";
import { avatarStyle, initialsFromName } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import type { MyInvitation } from "@/types/team";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function InviteCard({ invite }: { invite: MyInvitation }) {
  const [responding, setResponding] = useState(false);
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  function handleAccept() {
    setResponding(true);
    accept.mutate(invite.id, {
      onSuccess: () => toast.success(`Joined ${invite.team_name}.`),
      onError: (err) => {
        toast.error(err.message);
        setResponding(false);
      },
    });
  }

  function handleDecline() {
    setResponding(true);
    decline.mutate(invite.id, {
      onSuccess: () => toast.success(`Declined invite to ${invite.team_name}.`),
      onError: (err) => {
        toast.error(err.message);
        setResponding(false);
      },
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-pending/30 bg-pending/5 p-4 transition-opacity sm:flex-row sm:items-center sm:justify-between",
        responding && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10 shadow-sm">
          <AvatarFallback
            className={cn("font-medium", avatarStyle(invite.team_name))}
          >
            {initialsFromName(invite.team_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{invite.team_name}</p>
          <p className="text-sm text-muted-foreground">
            Invited as {invite.role} · Expires {formatDate(invite.expires_at)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDecline}
          disabled={responding}
        >
          {decline.isPending ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <X className="mr-1.5 size-3.5" />
          )}
          Decline
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleAccept}
          disabled={responding}
          className="bg-signal text-white hover:bg-signal/90"
        >
          {accept.isPending ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Check className="mr-1.5 size-3.5" />
          )}
          Accept
        </Button>
      </div>
    </div>
  );
}
