// src/components/dashboard/team/edit-token-dialog.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdateTeamToken } from "@/hooks/queries/use-team-tokens";
import type { TeamToken } from "@/types/team-token";
import { TokenActionDialog } from "./token-action-dialog";

type ExpiryOption = "30d" | "60d" | "90d" | "1y" | "never" | "unchanged";

function expiryToIsoDate(expiry: ExpiryOption): string | null | undefined {
  if (expiry === "unchanged") return undefined;
  if (expiry === "never") return null;
  const date = new Date();
  if (expiry === "30d") date.setDate(date.getDate() + 30);
  if (expiry === "60d") date.setDate(date.getDate() + 60);
  if (expiry === "90d") date.setDate(date.getDate() + 90);
  if (expiry === "1y") date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
}

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: "unchanged", label: "Keep current" },
  { value: "30d", label: "30 days" },
  { value: "60d", label: "60 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "never", label: "Never" },
];

type EditTokenDialogProps = {
  token: TeamToken | null;
  onOpenChange: (open: boolean) => void;
};

export function EditTokenDialog({ token, onOpenChange }: EditTokenDialogProps) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [expiry, setExpiry] = useState<ExpiryOption>("unchanged");
  const [error, setError] = useState<string | null>(null);

  const updateToken = useUpdateTeamToken();

  // Load the selected token into the form — adjusted during render, not in an effect.
  const [prevToken, setPrevToken] = useState(token);
  if (token !== prevToken) {
    setPrevToken(token);
    if (token) {
      setName(token.name);
      setPermissions(token.permissions);
      setExpiry("unchanged");
      setError(null);
    }
  }

  const isFormValid = name.trim().length >= 2 && permissions.length > 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;

    if (!isFormValid) {
      if (name.trim().length < 2)
        setError("Name must be at least 2 characters long.");
      else if (permissions.length === 0)
        setError("Select at least one permission.");
      return;
    }

    setError(null);

    const expires_at = expiryToIsoDate(expiry);

    updateToken.mutate(
      {
        tokenId: token.id,
        input: {
          name: name.trim(),
          permissions,
          ...(expires_at !== undefined ? { expires_at } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Token updated.");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <TokenActionDialog
      open={token !== null}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
      title="Edit Management Token"
      description="Changes take effect immediately. The token secret itself is unchanged. This only updates what it's allowed to do."
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
      isPending={updateToken.isPending}
      onSubmit={handleSubmit}
      submitButton={
        <Button type="submit" disabled={updateToken.isPending || !isFormValid}>
          {updateToken.isPending ? "Saving..." : "Save Changes"}
        </Button>
      }
    />
  );
}
