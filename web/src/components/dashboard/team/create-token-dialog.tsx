// src/components/dashboard/team/create-token-dialog.tsx

"use client";

import { Check, Copy, KeyRound, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTeamPermissions } from "@/hooks/queries/use-team-permissions";
import { useCreateTeamToken } from "@/hooks/queries/use-team-tokens";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { TokenActionDialog } from "./token-action-dialog";

type Step = "form" | "reveal";
type ExpiryOption = "15d" | "30d" | "60d" | "90d" | "1y" | "never";

// Returns `undefined` (not `null`) for "never". The create endpoint's
// contract is: omit `expires_at` entirely to mean "no expiration" — sending
// an explicit `null` causes the backend to fall back to a 90-day default.
function expiryToIsoDate(expiry: ExpiryOption): string | undefined {
  if (expiry === "never") return undefined;
  const date = new Date();
  if (expiry === "15d") date.setDate(date.getDate() + 15);
  if (expiry === "30d") date.setDate(date.getDate() + 30);
  if (expiry === "60d") date.setDate(date.getDate() + 60);
  if (expiry === "90d") date.setDate(date.getDate() + 90);
  if (expiry === "1y") date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
}

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: "15d", label: "15 days" },
  { value: "30d", label: "30 days" },
  { value: "60d", label: "60 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "never", label: "Never" },
];

export function CreateTokenDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [expiry, setExpiry] = useState<ExpiryOption>("90d");
  const [error, setError] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const { copied, copy, reset: resetCopied } = useCopyToClipboard(2000);

  const createToken = useCreateTeamToken();
  const { isOwner } = useTeamPermissions();

  if (!isOwner) {
    return null;
  }

  const isFormValid = name.trim().length >= 2 && permissions.length > 0;

  function reset() {
    setStep("form");
    setName("");
    setPermissions([]);
    setExpiry("90d");
    setError(null);
    setRevealedSecret(null);
    resetCopied();
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!isFormValid) {
      if (name.trim().length < 2)
        setError("Name must be at least 2 characters long.");
      else if (permissions.length === 0)
        setError("Select at least one permission.");
      return;
    }

    setError(null);

    const isoExpiry = expiryToIsoDate(expiry);

    createToken.mutate(
      {
        name: name.trim(),
        permissions,
        // Spread conditionally so the key is truly absent from the
        // request body for "never" — not just `undefined`-valued.
        ...(isoExpiry ? { expires_at: isoExpiry } : {}),
      },
      {
        onSuccess: ({ secret }) => {
          setRevealedSecret(secret);
          setStep("reveal");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleCopy() {
    if (revealedSecret) void copy(revealedSecret);
  }

  const revealContent = (
    <div className="flex min-h-0 flex-1 flex-col animate-fade-up">
      <DialogHeader className="shrink-0 px-6 pt-6">
        <DialogTitle>
          Save your token
          <span
            aria-hidden="true"
            className="ml-1 inline-block animate-caret text-primary/30"
          >
            _
          </span>
        </DialogTitle>
        <DialogDescription>
          This is the only time this key will be visible in plain text. Please
          store it securely in your secrets manager.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6">
        <div className="flex items-center gap-3 rounded-lg border border-input bg-muted/20 pl-4 pr-2 py-2 shadow-inner">
          <code className="flex-1 break-all font-mono text-sm tracking-tight text-foreground/90">
            {revealedSecret}
          </code>
          <Button
            type="button"
            variant={copied ? "default" : "secondary"}
            className={cn(
              "shrink-0 transition-all",
              copied ? "bg-signal text-white hover:bg-signal/90" : "",
            )}
            onClick={handleCopy}
            aria-label="Copy token"
          >
            {copied ? (
              <Check className="mr-2 size-4" />
            ) : (
              <Copy className="mr-2 size-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-pending/30 bg-pending/10 px-4 py-3 text-sm text-pending shadow-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <span className="leading-tight">
            Treat this token like a master password. Never commit it directly to
            your version control.
          </span>
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t border-border/40 px-6 py-4">
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setOpen(false)}
        >
          I&apos;ve saved it securely
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <TokenActionDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
      trigger={
        <DialogTrigger
          render={
            <Button className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20" />
          }
        >
          <KeyRound className="size-4" />
          Generate Token
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
          />
        </DialogTrigger>
      }
      title="Create Management Token"
      description="Secure your automated workflows. Do not use these to send standard API notifications."
      placeholder="e.g. Celery Worker Sync"
      name={name}
      onNameChange={(val) => {
        setName(val);
        setError(null);
      }}
      permissions={permissions}
      onPermissionsChange={(val) => {
        setPermissions(val);
        setError(null);
      }}
      expiry={expiry}
      onExpiryChange={(val) => setExpiry(val as ExpiryOption)}
      expiryOptions={EXPIRY_OPTIONS as { value: string; label: string }[]}
      error={error}
      isPending={createToken.isPending}
      onSubmit={handleCreate}
      submitButton={
        <Button
          type="submit"
          disabled={createToken.isPending || !isFormValid}
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {createToken.isPending ? "Generating..." : "Generate Token"}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
          />
        </Button>
      }
      showReveal={step === "reveal"}
      revealContent={revealContent}
    />
  );
}
