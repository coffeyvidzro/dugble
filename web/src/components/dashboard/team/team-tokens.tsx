import { KeySquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TeamCardHeader } from "./team-card-header";
import { TeamTokensClient } from "./team-tokens-client";

export function TeamTokens() {
    return (
        <Card className="border-border/40 shadow-sm">
            <TeamCardHeader
                icon={KeySquare}
                title="Management Tokens"
                description={
                    <>
                        Tokens for team administration. For sending Dugble
                        notifications, use a standard{" "}
                        <span className="rounded border border-border/50 bg-muted px-1 py-0.5 font-mono text-xs">
                            API Key
                        </span>
                        .
                    </>
                }
            />
            <TeamTokensClient />
        </Card>
    );
}
