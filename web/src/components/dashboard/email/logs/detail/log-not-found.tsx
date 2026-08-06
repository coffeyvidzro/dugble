import Link from "next/link";
import { FileQuestion } from "lucide-react";

export function LogNotFound() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/50">
                <FileQuestion className="size-5 text-muted-foreground" />
            </div>
            <h1 className="font-heading text-xl font-semibold text-foreground">
                Log not found
            </h1>
            <p className="max-w-sm text-sm text-muted-foreground">
                This log entry may have aged out of retention, or the link is
                incorrect.
            </p>
            <Link
                href="/dashboard/email/logs"
                className="mt-2 rounded-full border border-border/60 px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
            >
                Back to logs
            </Link>
        </div>
    );
}
