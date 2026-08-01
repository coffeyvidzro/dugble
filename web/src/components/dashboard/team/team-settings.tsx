import { DeleteTeamSection } from "./delete-team-section";
import { TeamHeader } from "./team-header";
import { TeamMembers } from "./team-members";
import { TeamMembersProvider } from "./team-members-context";
import { TeamOverview } from "./team-overview";
import { TeamTokens } from "./team-tokens";

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

export function TeamSettings({
    currentUser,
}: {
    currentUser: { email: string; name: string };
}) {
    const teamName = `${currentUser.name}'s Team`;

    return (
        <TeamMembersProvider currentUser={currentUser}>
            <div className="mx-auto w-full max-w-5xl pb-8">
                <TeamHeader teamName={teamName} />

                <div className="space-y-8">
                    <AnimatedSection delay={100}>
                        <TeamOverview initialName={teamName} />
                    </AnimatedSection>

                    <AnimatedSection delay={150}>
                        <TeamMembers />
                    </AnimatedSection>

                    <AnimatedSection delay={200}>
                        <TeamTokens />
                    </AnimatedSection>

                    <AnimatedSection delay={250}>
                        <DeleteTeamSection teamName={teamName} />
                    </AnimatedSection>
                </div>
            </div>
        </TeamMembersProvider>
    );
}
