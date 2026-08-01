import { ShieldAlert } from "lucide-react";
import { CopyButton } from "./copy-button";

export function SecretReveal({ secret }: { secret: string }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 pl-4 pr-2 py-2 shadow-inner">
                <code className="flex-1 break-all font-mono text-sm tracking-tight text-foreground/90">
                    {secret}
                </code>
                <CopyButton value={secret} />
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-pending/30 bg-pending/10 px-4 py-3 text-sm text-pending shadow-sm">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                <span className="leading-tight">
                    Store this secret securely. You won&apos;t be able to view
                    it again. Use it to verify that incoming requests actually
                    came from Dugble.
                </span>
            </div>
        </div>
    );
}
