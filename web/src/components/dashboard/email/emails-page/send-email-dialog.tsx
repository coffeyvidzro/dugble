"use client";

import { useState } from "react";
import { Loader2, Plus, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emailSchema = z.string().email();

export type SendEmailInput = {
    from: string;
    to: string[];
    subject: string;
    body: string;
};

export function SendEmailDialog({
    fromAddresses,
    onSend,
}: {
    fromAddresses: string[];
    onSend: (input: SendEmailInput) => void;
}) {
    const [open, setOpen] = useState(false);
    const [from, setFrom] = useState(fromAddresses[0] ?? "");
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [toError, setToError] = useState<string | null>(null);
    const [subjectError, setSubjectError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    function reset() {
        setFrom(fromAddresses[0] ?? "");
        setTo("");
        setSubject("");
        setBody("");
        setToError(null);
        setSubjectError(null);
        setSending(false);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        const recipients = to
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean);

        let hasError = false;

        if (recipients.length === 0) {
            setToError("Enter at least one recipient.");
            hasError = true;
        } else {
            const invalid = recipients.find(
                (r) => !emailSchema.safeParse(r).success,
            );
            if (invalid) {
                setToError(`"${invalid}" isn't a valid email address.`);
                hasError = true;
            } else {
                setToError(null);
            }
        }

        if (!subject.trim()) {
            setSubjectError("Enter a subject line.");
            hasError = true;
        } else {
            setSubjectError(null);
        }

        if (hasError) return;

        setSending(true);
        window.setTimeout(() => {
            onSend({
                from,
                to: recipients,
                subject: subject.trim(),
                body: body.trim(),
            });
            setOpen(false);
            reset();
        }, 500);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) reset();
            }}
        >
            <DialogTrigger render={<Button size="sm" className="shadow-sm" />}>
                <Plus className="mr-2 size-4" />
                Send email
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg border-border/40 shadow-xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Send email</DialogTitle>
                        <DialogDescription>
                            Send a one-off transactional email from a verified
                            address. For production sending, use the Dugble API
                            instead.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="send-email-from">From</Label>
                            <Select
                                value={from}
                                onValueChange={(value) =>
                                    value !== null && setFrom(value)
                                }
                            >
                                <SelectTrigger
                                    id="send-email-from"
                                    className="w-full border-foreground/15 bg-background focus:ring-primary/50"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {fromAddresses.map((address) => (
                                        <SelectItem
                                            key={address}
                                            value={address}
                                        >
                                            {address}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="send-email-to">To</Label>
                            <Input
                                id="send-email-to"
                                type="text"
                                placeholder="jane@example.com, sam@example.com"
                                value={to}
                                onChange={(event) => {
                                    setTo(event.target.value);
                                    setToError(null);
                                }}
                                className="border-foreground/15 bg-background font-mono text-sm focus-visible:ring-primary/50"
                            />
                            {toError ? (
                                <p className="text-xs font-medium text-danger animate-fade-up">
                                    {toError}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Separate multiple recipients with commas.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="send-email-subject">Subject</Label>
                            <Input
                                id="send-email-subject"
                                value={subject}
                                onChange={(event) => {
                                    setSubject(event.target.value);
                                    setSubjectError(null);
                                }}
                                placeholder="Your verification code"
                                className="border-foreground/15 bg-background focus-visible:ring-primary/50"
                            />
                            {subjectError && (
                                <p className="text-xs font-medium text-danger animate-fade-up">
                                    {subjectError}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="send-email-body">Body</Label>
                            <Textarea
                                id="send-email-body"
                                value={body}
                                onChange={(event) =>
                                    setBody(event.target.value)
                                }
                                placeholder="Write your message..."
                                rows={6}
                                className="border-foreground/15 bg-background text-sm focus-visible:ring-primary/50"
                            />
                            <p className="text-xs text-muted-foreground">
                                Plain text only. For rich HTML emails, send via
                                the API with a template.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border/40 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={sending}>
                            {sending ? (
                                <Loader2
                                    className="mr-2 size-4 animate-spin"
                                    data-icon="inline-start"
                                />
                            ) : (
                                <Send
                                    className="mr-2 size-4"
                                    data-icon="inline-start"
                                />
                            )}
                            {sending ? "Sending..." : "Send"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
