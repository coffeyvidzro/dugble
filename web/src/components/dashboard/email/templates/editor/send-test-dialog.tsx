"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
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

interface SendTestDialogProps {
    subject: string;
    compiledHtml: string;
}

export function SendTestDialog({ subject, compiledHtml }: SendTestDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [sendState, setSendState] = useState<"idle" | "sending" | "sent">(
        "idle",
    );

    function reset() {
        setEmail("");
        setSendState("idle");
    }

    function handleSend() {
        if (!email.trim() || sendState === "sending") return;
        setSendState("sending");
        // TODO: I'll wire this up with the backend 👌
        void compiledHtml;
        window.setTimeout(() => setSendState("sent"), 900);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) reset();
            }}
        >
            <DialogTrigger
                render={
                    <Button
                        variant="outline"
                        className="inline-flex items-center gap-1.5 rounded-full border-border/60 px-3.5 py-1.5 text-sm font-medium text-foreground hover:bg-muted/40"
                    />
                }
            >
                <Send className="size-3.5" />
                <span className="hidden sm:inline">Send test</span>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm border-border/40 shadow-xl">
                {sendState === "sent" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Test email sent</DialogTitle>
                            <DialogDescription>
                                Delivered to {email}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center gap-2 py-4 text-center animate-fade-up">
                            <div className="flex size-10 items-center justify-center rounded-full bg-signal/10">
                                <Check className="size-5 text-signal" />
                            </div>
                        </div>

                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-full"
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Send test email</DialogTitle>
                            <DialogDescription>
                                Sends &quot;{subject || "Untitled subject"}
                                &quot; with sample data.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2 py-4">
                            <Label htmlFor="send-test-email">Recipient</Label>
                            <Input
                                id="send-test-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="border-foreground/15 bg-background focus-visible:ring-primary/50"
                            />
                        </div>

                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSend}
                                disabled={
                                    !email.trim() || sendState === "sending"
                                }
                                className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                            >
                                {sendState === "sending" ? (
                                    <Loader2
                                        className="size-3.5 animate-spin"
                                        data-icon="inline-start"
                                    />
                                ) : (
                                    <Send
                                        className="size-3.5"
                                        data-icon="inline-start"
                                    />
                                )}
                                {sendState === "sending"
                                    ? "Sending..."
                                    : "Send test email"}
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                                />
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
