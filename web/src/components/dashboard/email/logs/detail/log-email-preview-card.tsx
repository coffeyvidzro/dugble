"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DeviceToggle } from "../../templates/editor/device-toggle";
import { InboxPreviewStrip } from "../../templates/editor/inbox-preview-strip";
import type { PreviewViewport } from "../../templates/editor/editor-types";
import type { LogEntry } from "../types";

export function LogEmailPreviewCard({ log }: { log: LogEntry }) {
    const [viewport, setViewport] = useState<PreviewViewport>("desktop");

    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="flex flex-col items-start gap-3 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">Preview</CardTitle>
                <DeviceToggle value={viewport} onChange={setViewport} />
            </CardHeader>
            <InboxPreviewStrip
                subject={log.subject}
                previewText={log.previewText}
            />
            <div className="flex justify-center overflow-auto bg-muted/20 p-4">
                <iframe
                    title={`Preview for ${log.requestId}`}
                    srcDoc={log.htmlBody}
                    sandbox=""
                    className={cn(
                        "min-h-96 rounded-lg border border-border/40 bg-white shadow-sm transition-all duration-300",
                        viewport === "mobile" ? "w-full max-w-80" : "w-full",
                    )}
                />
            </div>
        </Card>
    );
}
