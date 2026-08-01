"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    avatarStyle,
    formatDate,
    initialsFromName,
    MEMBERSHIP_ROLE_LABEL,
    type TeamInvite,
} from "./types";

export function InviteCard({
    invite,
    onAccept,
    onDecline,
}: {
    invite: TeamInvite;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
}) {
    const [responding, setResponding] = useState(false);

    function handleAccept() {
        setResponding(true);
        window.setTimeout(() => onAccept(invite.id), 400);
    }

    function handleDecline() {
        setResponding(true);
        window.setTimeout(() => onDecline(invite.id), 300);
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
                        className={cn(
                            "font-medium",
                            avatarStyle(invite.teamName),
                        )}
                    >
                        {initialsFromName(invite.teamName)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{invite.teamName}</p>
                    <p className="text-sm text-muted-foreground">
                        {invite.memberCount}{" "}
                        {invite.memberCount === 1 ? "member" : "members"} ·
                        Invited by {invite.inviterEmail}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                        {MEMBERSHIP_ROLE_LABEL[invite.role]} role ·{" "}
                        {formatDate(invite.createdAt)}
                    </p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleDecline}
                >
                    <X className="mr-1.5 size-3.5" />
                    Decline
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={handleAccept}
                    className="bg-signal text-white hover:bg-signal/90"
                >
                    <Check className="mr-1.5 size-3.5" />
                    Accept
                </Button>
            </div>
        </div>
    );
}
