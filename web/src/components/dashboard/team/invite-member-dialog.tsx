"use client";

import { useState } from "react";
import { Send, ShieldCheck, User, UserPlus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { TeamRole } from "./types";

const inviteSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    role: z.enum(["admin", "member"]),
});

const ROLE_OPTIONS: {
    value: TeamRole;
    label: string;
    description: string;
    icon: typeof User;
}[] = [
    {
        value: "member",
        label: "Member",
        description: "View logs and delivery workflows",
        icon: User,
    },
    {
        value: "admin",
        label: "Admin",
        description: "Full access, including API and billing",
        icon: ShieldCheck,
    },
];

export function InviteMemberDialog({
    existingEmails,
    onInvite,
}: {
    existingEmails: string[];
    onInvite: (email: string, role: TeamRole) => void;
}) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<TeamRole>("member");
    const [error, setError] = useState<string | null>(null);

    function reset() {
        setEmail("");
        setRole("member");
        setError(null);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();

        const result = inviteSchema.safeParse({ email: trimmedEmail, role });
        if (!result.success) {
            setError(result.error.issues[0]?.message ?? "Validation failed");
            return;
        }

        if (
            existingEmails.some(
                (existing) => existing.toLowerCase() === trimmedEmail,
            )
        ) {
            setError("This developer is already part of the workspace.");
            return;
        }

        onInvite(trimmedEmail, role);
        setOpen(false);
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
            <DialogTrigger
                render={
                    <Button className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20" />
                }
            >
                <UserPlus className="size-4" />
                Invite Member
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-border/40 shadow-xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Invite a new member</DialogTitle>
                        <DialogDescription>
                            Send an email invite to collaborate on Dugble
                            workflows and alerts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="member@email.com"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setError(null);
                                }}
                                className="bg-background transition-shadow focus-visible:ring-primary/50"
                                autoFocus
                            />
                            {error && (
                                <p className="text-xs font-medium text-danger animate-fade-up">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Workspace Role</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {ROLE_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    const selected = role === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setRole(option.value)
                                            }
                                            aria-pressed={selected}
                                            className={cn(
                                                "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all",
                                                selected
                                                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                                                    : "border-border/60 hover:border-border hover:bg-muted/30",
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "size-4",
                                                    selected
                                                        ? "text-primary"
                                                        : "text-muted-foreground",
                                                )}
                                            />
                                            <span className="text-sm font-medium">
                                                {option.label}
                                            </span>
                                            <span className="text-xs leading-snug text-muted-foreground">
                                                {option.description}
                                            </span>
                                        </button>
                                    );
                                })}
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
                            type="submit"
                            className="group/button relative inline-flex min-w-30 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                        >
                            <Send className="size-4" />
                            Send Invite
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                            />
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
