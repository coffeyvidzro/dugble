import { Inbox, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMyInvitations } from "@/hooks/queries/use-my-invitations";
import { InviteCard } from "./invite-card";
import { SectionCardHeader } from "./section-card-header";

export function PendingInvitesCard() {
  const { data: invites, isPending, isError, error } = useMyInvitations();

  return (
    <Card>
      <SectionCardHeader
        icon={Inbox}
        title="Invites"
        description="Teams that have invited you to join their workspace."
      />

      {isPending ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-danger">
            Couldn&apos;t load invites.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      ) : invites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
            <Inbox className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-heading text-lg font-medium">
            There are no invites
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            When someone invites you to their team, it&apos;ll show up here.
          </p>
        </div>
      ) : (
        <CardContent className="space-y-3 pt-6">
          {invites.map((invite) => (
            <InviteCard key={invite.id} invite={invite} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}
