import { AlertTriangle } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { SenderIdStatusBadge } from "./sender-id-status-badge";
import { SmsPreviewBubble } from "../../shared/sms-preview-bubble";
import { formatDate } from "../sms-dashboard/types";
import { SENDER_TYPE_LABEL, type SenderIdRequest } from "./types";

export function SenderIdDetailSheet({
    request,
    open,
    onOpenChange,
}: {
    request: SenderIdRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-md">
                {request && (
                    <>
                        <SheetHeader>
                            <div className="flex items-center justify-between gap-3">
                                <SheetTitle className="font-mono">{request.name}</SheetTitle>
                                <SenderIdStatusBadge status={request.status} />
                            </div>
                            <SheetDescription>
                                {SENDER_TYPE_LABEL[request.type]} · {request.flag}{" "}
                                {request.country}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 px-4 pb-6 sm:px-6">
                            {request.status === "rejected" && request.rejectionReason && (
                                <div className="flex gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    <p>{request.rejectionReason}</p>
                                </div>
                            )}

                            <div>
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                    Use case
                                </p>
                                <p className="text-sm text-foreground">{request.useCase}</p>
                            </div>

                            <div>
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                    Sample message
                                </p>
                                <div className="overflow-hidden rounded-lg border border-border/40">
                                    <SmsPreviewBubble
                                        senderLabel={request.name}
                                        message={request.sampleMessage}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <Field
                                    label="Messages sent"
                                    value={request.messagesSent.toLocaleString()}
                                />
                                <Field label="Submitted" value={formatDate(request.submittedAt)} />
                                {request.reviewedAt && (
                                    <Field
                                        label="Reviewed"
                                        value={formatDate(request.reviewedAt)}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm text-foreground">{value}</p>
        </div>
    );
}
