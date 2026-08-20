"use client";

import { ShieldAlert } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { PermissionPicker } from "./permission-picker";

export type TokenActionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: React.ReactNode;

    title: React.ReactNode;
    description: React.ReactNode;
    placeholder?: string;

    name: string;
    onNameChange: (val: string) => void;
    permissions: string[];
    onPermissionsChange: (val: string[]) => void;
    expiry: string;
    onExpiryChange: (val: string) => void;
    expiryOptions: { value: string; label: string }[];
    error: string | null;

    isPending: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitButton: React.ReactNode;

    showReveal?: boolean;
    revealContent?: React.ReactNode;
};

export function TokenActionDialog({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    placeholder,
    name,
    onNameChange,
    permissions,
    onPermissionsChange,
    expiry,
    onExpiryChange,
    expiryOptions,
    error,
    isPending,
    onSubmit,
    submitButton,
    showReveal,
    revealContent,
}: TokenActionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger}
            <DialogContent className="flex max-h-[92vh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden border-border/40 p-0 shadow-xl sm:max-w-xl md:max-w-xl lg:max-w-2xl">
                {showReveal && revealContent ? (
                    revealContent
                ) : (
                    <form
                        onSubmit={onSubmit}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <DialogHeader className="shrink-0 px-6 pt-6">
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>{description}</DialogDescription>
                        </DialogHeader>

                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6 no-scrollbar">
                            <div className="space-y-2">
                                <Label htmlFor="token-name">Identifier</Label>
                                <Input
                                    id="token-name"
                                    placeholder={placeholder}
                                    value={name}
                                    onChange={(e) =>
                                        onNameChange(e.target.value)
                                    }
                                    disabled={isPending}
                                    className="border-input bg-background focus-visible:ring-primary/50"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <PermissionPicker
                                    value={permissions}
                                    onChange={onPermissionsChange}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Expiration</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 rounded-lg border border-input bg-muted/20 p-1">
                                    {expiryOptions.map((option) => {
                                        const isSelected =
                                            expiry === option.value;
                                        const risky = option.value === "never";
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    onExpiryChange(option.value)
                                                }
                                                aria-pressed={isSelected}
                                                className={cn(
                                                    "rounded-md px-2 py-1.5 text-xs font-medium transition-all",
                                                    isSelected
                                                        ? risky
                                                            ? "bg-danger/10 text-danger shadow-sm"
                                                            : "bg-card text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground",
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {expiry === "never" && (
                                    <p className="flex items-start gap-1.5 text-xs text-danger animate-fade-up">
                                        <ShieldAlert className="mt-0.5 size-3 shrink-0" />
                                        Tokens that never expire raise your
                                        exposure if one leaks. Prefer a fixed
                                        expiry where possible.
                                    </p>
                                )}
                            </div>

                            {error && (
                                <p className="text-xs font-medium text-danger animate-fade-up">
                                    {error}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="flex-row items-center justify-end gap-2 shrink-0 border-t border-border/40 px-6 py-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            {submitButton}
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
