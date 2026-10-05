// src/components/dashboard/logout-button.tsx
"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLogout } from "@/hooks/mutations/use-auth";
import { publicBaseUrl } from "@/lib/public-base-url";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onError: () => {
        toast.error(
          "Sign out didn't fully complete, but we're taking you out anyway.",
        );
      },
      onSettled: () => {
        window.location.href = publicBaseUrl;
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={logout.isPending}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-4 shrink-0" />
      <span className="truncate">
        {logout.isPending ? "Signing out…" : "Log out"}
      </span>
    </button>
  );
}
