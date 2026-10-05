import { Suspense } from "react";
import { TeamInvitationForm } from "@/components/auth/team-invitation-form";
import { requireSession } from "@/lib/session";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Team Invitation",
  description: "Accept or decline a Dugble team invitation.",
  path: "/team-invitations",
  preset: "auth",
});

function TeamInvitationFallback() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  );
}

export default async function Page() {
  await requireSession();

  return (
    <Suspense fallback={<TeamInvitationFallback />}>
      <TeamInvitationForm />
    </Suspense>
  );
}
