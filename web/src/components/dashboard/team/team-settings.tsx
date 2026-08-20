// src/components/dashboard/team/team-settings.tsx

"use client";

import Link from "next/link";
import { Loader2, Plus } from "lucide-react";

import { DeleteTeamSection } from "./delete-team-section";
import { TeamHeader } from "./team-header";
import { TeamMembers } from "./team-members";
import { TeamOverview } from "./team-overview";
import { TeamTokens } from "./team-tokens";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActiveTeam } from "@/hooks/queries/use-active-team";

function TeamSettingsSkeleton() {
    return (
        <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
    );
}

function AnimatedSection({
    children,
    delay,
}: {
    children: React.ReactNode;
    delay: number;
}) {
    return (
        <div
            className="animate-fade-up"
            style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
        >
            {children}
        </div>
    );
}

export function TeamSettings() {
    const activeTeam = useActiveTeam();

    if (activeTeam.status === "pending") {
        return <TeamSettingsSkeleton />;
    }

    if (activeTeam.status === "error") {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm font-medium text-danger">
                    Couldn&apos;t load your team.
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                    {activeTeam.error.message}
                </p>
            </div>
        );
    }

    if (activeTeam.status === "empty") {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                <div className="space-y-1">
                    <p className="text-sm font-medium">
                        You don&apos;t belong to a team yet.
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Create a team to invite people and manage shared API
                        keys.
                    </p>
                </div>
                <Link
                    href="/dashboard/create-team"
                    className={cn(buttonVariants({}), "mt-1 gap-2")}
                >
                    <Plus className="size-4" />
                    Create a team
                </Link>
            </div>
        );
    }

    const { team } = activeTeam;

    return (
        <div className="mx-auto w-full max-w-5xl pb-8">
            <TeamHeader teamId={team.id} teamName={team.name} />

            <div className="space-y-8">
                <AnimatedSection delay={100}>
                    <TeamOverview teamId={team.id} />
                </AnimatedSection>

                <AnimatedSection delay={150}>
                    <TeamMembers teamId={team.id} />
                </AnimatedSection>

                <AnimatedSection delay={200}>
                    <TeamTokens />
                </AnimatedSection>

                <AnimatedSection delay={250}>
                    <DeleteTeamSection teamId={team.id} teamName={team.name} />
                </AnimatedSection>
            </div>
        </div>
    );
}
