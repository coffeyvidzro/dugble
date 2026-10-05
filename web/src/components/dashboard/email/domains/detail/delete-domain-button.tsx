"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteSenderDomain } from "@/hooks/queries/use-sender-domains-api";

export function DeleteDomainButton({
  domainId,
  domainName,
}: {
  domainId: string;
  domainName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const deleteDomain = useDeleteSenderDomain();

  function handleDelete() {
    deleteDomain.mutate(domainId, {
      onSuccess: () => {
        setOpen(false);
        router.push("/dashboard/email/domains");
      },
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
        Disable domain
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disable {domainName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Dugble will immediately stop sending email for this domain.
            You&apos;ll need to add it again and reverify DNS records to restore
            it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteDomain.isPending}
            onClick={handleDelete}
            className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-danger px-4 py-2 font-mono text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-danger/90 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 disabled:pointer-events-none disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {deleteDomain.isPending ? "Disabling…" : "Disable domain"}
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
