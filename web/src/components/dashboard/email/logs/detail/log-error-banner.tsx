import { AlertTriangle } from "lucide-react";

export function LogErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/5 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
            <p className="text-sm text-danger">{message}</p>
        </div>
    );
}
