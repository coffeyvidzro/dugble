// src/components/dashboard/email/domains/list/domain-row-actions.tsx

"use client";

import { Check, Copy, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { useDeleteSenderDomain } from "@/hooks/queries/use-sender-domains-api";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { SenderDomain } from "@/types/sender-domain-api";

export function DomainRowActions({ domain }: { domain: SenderDomain }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { copied, copy } = useCopyToClipboard(1500);
  const deleteDomain = useDeleteSenderDomain();

  function handleCopy() {
    void copy(domain.name);
  }

  function handleDelete() {
    deleteDomain.mutate(domain.id, {
      onSuccess: () => setConfirmOpen(false),
    });
  }

  return (
    <span className="relative z-10 inline-flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More actions for ${domain.name}`}
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
            Disable domain
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable {domain.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Dugble will immediately stop sending email for this domain.
              You&apos;ll need to add it again and reverify DNS records to
              restore it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-white hover:bg-danger/90"
              disabled={deleteDomain.isPending}
              onClick={handleDelete}
            >
              {deleteDomain.isPending ? "Disabling…" : "Disable domain"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  );
}
