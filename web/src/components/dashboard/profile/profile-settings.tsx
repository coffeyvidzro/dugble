"use client";

import { Loader2 } from "lucide-react";
import { useTeams } from "@/hooks/queries/use-teams";
import { useCurrentUser } from "@/hooks/queries/use-user";
import { AccountEmailCard } from "./account-email-card";
import { DeleteAccountCard } from "./delete-account-card";
import { PendingInvitesCard } from "./pending-invites-card";
import { ProfileHeader } from "./profile-header";
import { UserTeamsCard } from "./user-teams-card";

export function ProfileSettings() {
  const { data: user, isPending, isError, error } = useCurrentUser();

  const { data: teams } = useTeams({ page: 1, limit: 1 });

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-danger">
          Couldn&apos;t load your profile.
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-8">
      <ProfileHeader
        name={user.name}
        teamCount={teams?.pagination.total ?? 0}
      />

      <div className="space-y-8">
        <div>
          <AccountEmailCard
            email={user.email}
            emailVerified={user.email_verified}
          />
        </div>

        <div>
          <PendingInvitesCard />
        </div>

        <div>
          <UserTeamsCard />
        </div>

        <div>
          <DeleteAccountCard currentEmail={user.email} />
        </div>
      </div>
    </div>
  );
}
