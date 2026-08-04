"use client";

import { useState, useTransition } from "react";

import { Check, Copy, MoreVertical, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDomainAction } from "@/components/dashboard/email/domains/utils/actions";
import type { SendingDomain } from "@/components/dashboard/email/domains/utils/types";

export function DomainRowActions({ domain }: { domain: SendingDomain }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(domain.domain);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard API unavailable. This fail silently. TODO: I'll probably consider showing a toast notification to the user. 👌
        }
    }

    function handleDelete() {
        startTransition(async () => {
            await deleteDomainAction(domain.id);
        });
        setConfirmOpen(false);
    }

    return (
        <span className="relative z-10 inline-flex">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label={`More actions for ${domain.domain}`}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    >
                        <MoreVertical className="size-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onSelect={(event) => {
                            event.preventDefault();
                            handleCopy();
                        }}
                    >
                        {copied ? (
                            <Check className="size-3.5" />
                        ) : (
                            <Copy className="size-3.5" />
                        )}
                        {copied ? "Copied" : "Copy domain name"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-danger focus:bg-danger/10 focus:text-danger"
                        onSelect={() => setConfirmOpen(true)}
                    >
                        <Trash2 className="size-3.5" />
                        Delete domain
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {domain.domain}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Dugble will immediately stop sending and receiving
                            email for this domain. You&apos;ll need to add it
                            again and reverify DNS records to restore it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-danger text-white hover:bg-danger/90"
                            disabled={isPending}
                            onClick={handleDelete}
                        >
                            {isPending ? "Deleting…" : "Delete domain"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </span>
    );
}
