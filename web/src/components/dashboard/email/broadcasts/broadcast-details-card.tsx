import { Mail } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { InboxPreview } from "./inbox-preview";
import { SENDING_DOMAINS } from "../email-dashboard/types";

const VERIFIED_DOMAINS = SENDING_DOMAINS.filter((d) => d.status === "verified");

const MAX_SUBJECT_LENGTH = 60;
const MAX_PREVIEW_LENGTH = 90;

function counterTone(length: number, max: number): string {
    if (length > max) return "text-danger";
    if (length > max * 0.85) return "text-pending";
    return "text-muted-foreground";
}

export function BroadcastDetailsCard({
    subject,
    onSubjectChange,
    previewText,
    onPreviewTextChange,
    fromName,
    onFromNameChange,
    fromLocalPart,
    onFromLocalPartChange,
    fromDomain,
    onFromDomainChange,
}: {
    subject: string;
    onSubjectChange: (value: string) => void;
    previewText: string;
    onPreviewTextChange: (value: string) => void;
    fromName: string;
    onFromNameChange: (value: string) => void;
    fromLocalPart: string;
    onFromLocalPartChange: (value: string) => void;
    fromDomain: string;
    onFromDomainChange: (value: string) => void;
}) {
    const fromEmail = `${fromLocalPart || "news"}@${fromDomain}`;
    const inputClass =
        "w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40";

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                        <Mail className="size-4" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-xl">
                            Broadcast Details
                        </CardTitle>
                        <CardDescription>
                            The subject line, preview text, and sender identity
                            recipients will see.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                        Subject line
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            <Label htmlFor="broadcast-subject">Subject</Label>
                            <span
                                className={cn(
                                    "font-mono text-[11px]",
                                    counterTone(
                                        subject.length,
                                        MAX_SUBJECT_LENGTH,
                                    ),
                                )}
                            >
                                {subject.length}/{MAX_SUBJECT_LENGTH}
                            </span>
                        </div>
                        <input
                            id="broadcast-subject"
                            value={subject}
                            onChange={(event) =>
                                onSubjectChange(event.target.value)
                            }
                            placeholder="Your October product update"
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            <Label htmlFor="broadcast-preview">
                                Preview text
                            </Label>
                            <span
                                className={cn(
                                    "font-mono text-[11px]",
                                    counterTone(
                                        previewText.length,
                                        MAX_PREVIEW_LENGTH,
                                    ),
                                )}
                            >
                                {previewText.length}/{MAX_PREVIEW_LENGTH}
                            </span>
                        </div>
                        <input
                            id="broadcast-preview"
                            value={previewText}
                            onChange={(event) =>
                                onPreviewTextChange(event.target.value)
                            }
                            placeholder="Shown next to the subject line in most inboxes"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="space-y-4 border-t border-border/40 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                        Sender
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="broadcast-from-name">
                                From name
                            </Label>
                            <input
                                id="broadcast-from-name"
                                value={fromName}
                                onChange={(event) =>
                                    onFromNameChange(event.target.value)
                                }
                                placeholder="Dugble"
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="broadcast-from-email">
                                From address
                            </Label>
                            <div className="flex overflow-hidden rounded-lg border border-border shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40">
                                <input
                                    id="broadcast-from-email"
                                    value={fromLocalPart}
                                    onChange={(event) =>
                                        onFromLocalPartChange(
                                            event.target.value.replace(
                                                /[^a-z0-9._-]/gi,
                                                "",
                                            ),
                                        )
                                    }
                                    placeholder="news"
                                    className="min-w-0 flex-1 bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                />
                                <span className="flex items-center bg-muted/40 px-2 font-mono text-sm text-muted-foreground">
                                    @
                                </span>
                                <select
                                    value={fromDomain}
                                    onChange={(event) =>
                                        onFromDomainChange(event.target.value)
                                    }
                                    className="flex-1 bg-muted/20 px-2 font-mono text-sm text-foreground focus:outline-none"
                                >
                                    {VERIFIED_DOMAINS.map((domain) => (
                                        <option
                                            key={domain.id}
                                            value={domain.domain}
                                        >
                                            {domain.domain}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-6">
                    <InboxPreview
                        fromName={fromName}
                        fromEmail={fromEmail}
                        subject={subject}
                        previewText={previewText}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
