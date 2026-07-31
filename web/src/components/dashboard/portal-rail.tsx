"use client";

import Link from "next/link";

import { LayoutGrid } from "lucide-react";

import { WorkspaceSwitcher } from "./workspace/workspace-switcher";
import type { DashboardPortal } from "./dashboard-nav";
import type { SessionUser } from "@/lib/session";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function PortalRail({
  portals,
  activePortalId,
  onSelectPortal,
  user,
}: {
  portals: DashboardPortal[];
  activePortalId: string | null;
  onSelectPortal: (portal: DashboardPortal) => void;
  user: SessionUser;
}) {
  const smsPortal = portals.find((p) => p.id === "sms");
  const emailPortal = portals.find((p) => p.id === "email");
  const walletPortal = portals.find((p) => p.id === "wallet");
  const accountPortal = portals.find((p) => p.id === "account");
  const displayName = user.name.trim() || user.email;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="hidden h-full w-14 shrink-0 flex-col items-center gap-2 border-r bg-sidebar py-3 md:flex">
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/dashboard"
              aria-label="Dugble home"
              className="flex size-10 items-center justify-center rounded-xl transition-opacity hover:opacity-80"
            />
          }
        >
          <img
            src="/brand/mark-light-bg.svg"
            alt=""
            className="size-8 rounded-xl dark:hidden"
          />
          <img
            src="/brand/mark-dark-bg.svg"
            alt=""
            className="hidden size-8 rounded-xl dark:block"
          />
        </TooltipTrigger>
        <TooltipContent side="right">Overview</TooltipContent>
      </Tooltip>

      <div className="h-px w-6 bg-border" />

      <WorkspaceSwitcher />

      {[smsPortal, emailPortal].filter(Boolean).map((portal) => (
        <RailButton
          key={portal!.id}
          portal={portal!}
          active={activePortalId === portal!.id}
          onClick={() => onSelectPortal(portal!)}
        />
      ))}

      <div className="flex-1" />

      <button
        type="button"
        disabled
        aria-hidden
        tabIndex={-1}
        title="Coming soon"
        className="flex size-10 cursor-not-allowed items-center justify-center rounded-xl text-muted-foreground/40"
      >
        <LayoutGrid className="size-4" />
      </button>

      {walletPortal && (
        <RailButton
          portal={walletPortal}
          active={activePortalId === walletPortal.id}
          onClick={() => onSelectPortal(walletPortal)}
        />
      )}

      {accountPortal && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={accountPortal.label}
                onClick={() => onSelectPortal(accountPortal)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border font-medium text-xs transition-colors",
                  activePortalId === accountPortal.id
                    ? "border-signal/50 bg-signal/10 text-signal"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              />
            }
          >
            {initials}
          </TooltipTrigger>
          <TooltipContent side="right">{accountPortal.label}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function RailButton({
  portal,
  active,
  onClick,
}: {
  portal: DashboardPortal;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={portal.label}
            onClick={onClick}
            className={cn(
              "flex size-10 items-center justify-center rounded-xl border transition-colors",
              active
                ? "border-signal/40 bg-signal/10 text-signal"
                : "border-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          />
        }
      >
        <portal.icon className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="right">{portal.label}</TooltipContent>
    </Tooltip>
  );
}
