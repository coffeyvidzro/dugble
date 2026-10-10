import { ArrowRight, KeySquare } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TeamCardHeader } from "./team-card-header";

/**
 * API tokens now live under Developers → API tokens. Team settings keeps
 * this card so people who look for them here can still find them.
 */
export function TeamTokens() {
  return (
    <Card>
      <TeamCardHeader
        icon={KeySquare}
        title="API tokens"
        description="Tokens for team administration and automation are managed in the Developers section."
      />
      <CardContent>
        <Link
          href="/dashboard/developers/api-tokens"
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          Manage API tokens
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
