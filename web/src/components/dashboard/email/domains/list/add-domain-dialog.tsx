"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { createDomainAction } from "@/components/dashboard/email/domains/utils/actions";
import { isValidDomain } from "@/components/dashboard/email/domains/utils/validation";

export function AddDomainDialog() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const inputId = useId();

    function handleOpenChange(next: boolean) {
        if (isPending) return;
        setOpen(next);
        if (!next) {
            setValue("");
            setError(null);
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmed = value.trim().toLowerCase();

        if (!isValidDomain(trimmed)) {
            setError("Enter a valid domain, e.g. notify.yourcompany.com");
            return;
        }

        startTransition(async () => {
            const result = await createDomainAction(trimmed);
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20">
                        <Plus className="size-4" />
                        Add domain
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                        />
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add a sending domain</DialogTitle>
                        <DialogDescription>
                            Use a domain or subdomain you own, like{" "}
                            <span className="font-mono">
                                notify.yourcompany.com
                            </span>
                            . We&apos;ll generate DNS records for verification,
                            sending, receiving, and tracking.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1.5 py-4">
                        <Label htmlFor={inputId}>Domain</Label>
                        <Input
                            id={inputId}
                            placeholder="notify.yourcompany.com"
                            value={value}
                            onChange={(event) => {
                                setValue(event.target.value);
                                if (error) setError(null);
                            }}
                            className="font-mono"
                            autoFocus
                            autoComplete="off"
                            spellCheck={false}
                            disabled={isPending}
                        />
                        {error && (
                            <p className="text-xs text-danger">{error}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 disabled:pointer-events-none disabled:opacity-50"
                        >
                            <Plus className="size-4" />
                            {isPending ? "Adding…" : "Add domain"}
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
