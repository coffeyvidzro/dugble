import { Inbox } from "lucide-react";

import { SectionCardHeader } from "./section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { InviteCard } from "./invite-card";
import type { TeamInvite } from "./types";

export function PendingInvitesCard({
    invites,
    onAccept,
    onDecline,
}: {
    invites: TeamInvite[];
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Inbox}
                title="Invites"
                description="Teams that have invited you to join their workspace."
            />

            {invites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <Inbox className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        There are no invites
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        When someone invites you to their team, it&apos;ll show
                        up here.
                    </p>
                </div>
            ) : (
                <CardContent className="space-y-3 pt-6">
                    {invites.map((invite) => (
                        <InviteCard
                            key={invite.id}
                            invite={invite}
                            onAccept={onAccept}
                            onDecline={onDecline}
                        />
                    ))}
                </CardContent>
            )}
        </Card>
    );
}
