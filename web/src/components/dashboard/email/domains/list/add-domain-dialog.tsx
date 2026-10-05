// src/components/dashboard/email/domains/list/add-domain-dialog.tsx

"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSenderDomain } from "@/hooks/queries/use-sender-domains-api";
import {
  DOMAIN_REGION_LABEL,
  type DomainRegion,
  isProvisioningResponse,
} from "@/types/sender-domain-api";

const REGIONS: DomainRegion[] = ["us-east-1", "eu-north-1"];

export function AddDomainDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [region, setRegion] = useState<DomainRegion>("us-east-1");
  const [error, setError] = useState<string | null>(null);
  const [provisioningMessage, setProvisioningMessage] = useState<string | null>(
    null,
  );
  const createDomain = useCreateSenderDomain();
  const inputId = useId();

  function handleOpenChange(next: boolean) {
    if (createDomain.isPending) return;
    setOpen(next);
    if (!next) {
      setValue("");
      setError(null);
      setProvisioningMessage(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim().toLowerCase();

    if (!trimmed) {
      setError("Enter a domain, e.g. notify.yourcompany.com");
      return;
    }

    setError(null);
    createDomain.mutate(
      { name: trimmed, region },
      {
        onSuccess: (result) => {
          if (isProvisioningResponse(result)) {
            setProvisioningMessage(result.message);
            return;
          }
          setOpen(false);
          router.push(`/dashboard/email/domains/${result.id}`);
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Couldn't add that domain.",
          );
        },
      },
    );
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
              <span className="font-mono">notify.yourcompany.com</span>.
              We&apos;ll generate DNS records for verification and sending.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
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
                disabled={createDomain.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="domain-region">Region</Label>
              <Select
                value={region}
                onValueChange={(v) => v && setRegion(v as DomainRegion)}
              >
                <SelectTrigger id="domain-region" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {DOMAIN_REGION_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}
            {provisioningMessage && (
              <p className="text-xs text-pending">
                {provisioningMessage} Check back shortly and refresh this page.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createDomain.isPending}
              className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 disabled:pointer-events-none disabled:opacity-50"
            >
              <Plus className="size-4" />
              {createDomain.isPending ? "Adding…" : "Add domain"}
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
