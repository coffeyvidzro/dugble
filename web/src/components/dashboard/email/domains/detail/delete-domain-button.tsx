"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteDomainAction } from "@/components/dashboard/email/domains/utils/actions";

export function DeleteDomainButton({
    domainId,
    domainName,
}: {
    domainId: string;
    domainName: string;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            await deleteDomainAction(domainId, { redirectToList: true });
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger
                render={
                    <Button
                        variant="outline"
                        className="gap-1.5 border-danger/40 text-danger hover:bg-danger/10 hover:text-danger"
                    />
                }
            >
                <Trash2 className="size-4" />
                Delete domain
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {domainName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Dugble will immediately stop sending and receiving email
                        for this domain. You&apos;ll need to add it again and
                        reverify DNS records to restore it.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending}
                        onClick={handleDelete}
                        className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-danger px-4 py-2 font-mono text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-danger/90 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 disabled:pointer-events-none disabled:opacity-50"
                    >
                        <Trash2 className="size-4" />
                        {isPending ? "Deleting…" : "Delete domain"}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                        />
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
