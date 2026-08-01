"use client";

import { useState } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SecretReveal } from "./secret-reveal";
import type { Webhook } from "./types";

type Step = "confirm" | "reveal";

export function RollSecretDialog({
    webhook,
    onOpenChange,
    onRoll,
}: {
    webhook: Webhook | null;
    onOpenChange: (open: boolean) => void;
    onRoll: (id: string) => string;
}) {
    const [step, setStep] = useState<Step>("confirm");
    const [newSecret, setNewSecret] = useState<string | null>(null);

    function handleOpenChange(next: boolean) {
        onOpenChange(next);
        if (!next) {
            setStep("confirm");
            setNewSecret(null);
        }
    }

    function handleConfirmRoll() {
        if (!webhook) return;
        const full = onRoll(webhook.id);
        setNewSecret(full);
        setStep("reveal");
    }

    return (
        <Dialog open={webhook !== null} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md border-border/40 shadow-xl">
                {step === "confirm" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Roll signing secret?</DialogTitle>
                            <DialogDescription>
                                The current secret for{" "}
                                <span className="font-mono text-xs">
                                    {webhook?.url}
                                </span>{" "}
                                will stop working immediately. Update your
                                endpoint with the new secret to keep verifying
                                incoming requests.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-pending/40 text-pending hover:bg-pending/10"
                                onClick={handleConfirmRoll}
                            >
                                <RefreshCw className="mr-2 size-4" />
                                Roll secret
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="animate-fade-up">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="size-5 text-pending" />
                                New secret generated
                            </DialogTitle>
                            <DialogDescription>
                                This is the only time this secret will be shown
                                in full.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                            <SecretReveal secret={newSecret ?? ""} />
                        </div>
                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                className="w-full sm:w-auto"
                                onClick={() => handleOpenChange(false)}
                            >
                                I&apos;ve saved it securely
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
