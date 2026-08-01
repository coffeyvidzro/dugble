"use client";

import { useId, useState } from "react";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TypedConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmPhrase,
    caseInsensitive = false,
    confirmLabel = "Permanently Delete",
    pendingLabel = "Deleting...",
    cancelLabel = "Cancel",
    pending = false,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    description: React.ReactNode;
    confirmPhrase: string;
    caseInsensitive?: boolean;
    confirmLabel?: string;
    pendingLabel?: string;
    cancelLabel?: string;
    pending?: boolean;
    onConfirm: () => void;
}) {
    const inputId = useId();
    const [confirmText, setConfirmText] = useState("");

    function handleOpenChange(next: boolean) {
        onOpenChange(next);
        if (!next) setConfirmText("");
    }

    const canConfirm = caseInsensitive
        ? confirmText.trim().toLowerCase() === confirmPhrase.toLowerCase()
        : confirmText.trim() === confirmPhrase;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md border-danger/20 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-danger">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    <Label htmlFor={inputId} className="text-sm font-medium">
                        Please type{" "}
                        <span className="font-mono bg-muted/50 px-1 py-0.5 rounded text-foreground">
                            {confirmPhrase}
                        </span>{" "}
                        to confirm.
                    </Label>
                    <Input
                        id={inputId}
                        value={confirmText}
                        onChange={(event) => setConfirmText(event.target.value)}
                        placeholder={confirmPhrase}
                        className="bg-background focus-visible:ring-danger/50"
                        autoFocus
                    />
                </div>

                <DialogFooter className="border-t border-border/40 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        disabled={!canConfirm || pending}
                        onClick={onConfirm}
                        className="bg-danger text-white hover:bg-danger/90 transition-colors"
                    >
                        {pending ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : null}
                        {pending ? pendingLabel : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
