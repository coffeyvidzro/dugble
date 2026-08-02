"use client";

import { useState } from "react";
import {
    Check,
    Copy,
    Download,
    Loader2,
    QrCode,
    ShieldCheck,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { OtpInput } from "./otp-input";
import { generateRecoveryCodes } from "./types";

type SetupStep = "intro" | "verify" | "recovery";

const MOCK_SECRET = "JBSW Y3DP EHPK 3PXP";

export function TwoFactorSetupDialog({
    onComplete,
}: {
    onComplete: (recoveryCodes: string[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<SetupStep>("intro");
    const [code, setCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [copiedCodes, setCopiedCodes] = useState(false);

    function reset() {
        setStep("intro");
        setCode("");
        setVerifying(false);
        setVerifyError(null);
        setCopiedCodes(false);
    }

    function handleVerify() {
        if (code.length !== 6) {
            setVerifyError("Enter all 6 digits.");
            return;
        }
        setVerifyError(null);
        setVerifying(true);
        window.setTimeout(() => {
            setRecoveryCodes(generateRecoveryCodes());
            setStep("recovery");
            setVerifying(false);
        }, 500);
    }

    async function handleCopyCodes() {
        await navigator.clipboard.writeText(recoveryCodes.join("\n"));
        setCopiedCodes(true);
        window.setTimeout(() => setCopiedCodes(false), 2000);
    }

    function handleDownloadCodes() {
        const blob = new Blob(
            [
                `Dugble recovery codes\nGenerated ${new Date().toLocaleString()}\n\n${recoveryCodes.join("\n")}\n`,
            ],
            { type: "text/plain" },
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "dugble-recovery-codes.txt";
        link.click();
        URL.revokeObjectURL(url);
    }

    function handleFinish() {
        setOpen(false);
        onComplete(recoveryCodes);
        reset();
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
                <ShieldCheck className="mr-2 size-4" />
                Enable 2FA
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-border/40 shadow-xl">
                {step === "intro" && (
                    <div className="animate-fade-up">
                        <DialogHeader>
                            <DialogTitle>Scan the QR code</DialogTitle>
                            <DialogDescription>
                                Use an authenticator app like 1Password, Authy,
                                or Google Authenticator.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-6">
                            <div className="mx-auto flex size-40 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
                                <QrCode className="size-16 text-muted-foreground/60" />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-center text-xs text-muted-foreground">
                                    Or enter this code manually
                                </p>
                                <div className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                                    <code className="font-mono text-sm tracking-wide text-foreground/90">
                                        {MOCK_SECRET}
                                    </code>
                                </div>
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
                            <Button
                                type="button"
                                onClick={() => setStep("verify")}
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === "verify" && (
                    <div className="animate-fade-up">
                        <DialogHeader>
                            <DialogTitle>Enter the 6-digit code</DialogTitle>
                            <DialogDescription>
                                Enter the code shown in your authenticator app
                                to confirm setup.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-6">
                            <OtpInput
                                value={code}
                                onChange={(value) => {
                                    setCode(value);
                                    setVerifyError(null);
                                }}
                            />
                            {verifyError && (
                                <p className="text-center text-xs font-medium text-danger animate-fade-up">
                                    {verifyError}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep("intro")}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={handleVerify}
                                disabled={verifying}
                            >
                                {verifying ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : null}
                                {verifying ? "Verifying..." : "Verify"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === "recovery" && (
                    <div className="animate-fade-up">
                        <DialogHeader>
                            <DialogTitle>Save your recovery codes</DialogTitle>
                            <DialogDescription>
                                Store these somewhere safe. Each code can be
                                used once to sign in if you lose access to your
                                authenticator app.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-6">
                            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-muted/20 p-4">
                                {recoveryCodes.map((rc) => (
                                    <code
                                        key={rc}
                                        className="font-mono text-sm text-foreground/90"
                                    >
                                        {rc}
                                    </code>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className={cn(
                                        "flex-1 transition-all",
                                        copiedCodes &&
                                            "bg-signal text-white hover:bg-signal/90",
                                    )}
                                    onClick={handleCopyCodes}
                                >
                                    {copiedCodes ? (
                                        <Check className="mr-2 size-4" />
                                    ) : (
                                        <Copy className="mr-2 size-4" />
                                    )}
                                    {copiedCodes ? "Copied" : "Copy all"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={handleDownloadCodes}
                                >
                                    <Download className="mr-2 size-4" />
                                    Download
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                className="w-full sm:w-auto"
                                onClick={handleFinish}
                            >
                                I&apos;ve saved these codes
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
