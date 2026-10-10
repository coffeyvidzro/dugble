"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { DashboardPortal } from "./dashboard-nav";
import { TeamSwitcher } from "./team/team-switcher";

const RAIL_ITEM =
  "flex size-10 items-center justify-center rounded-xl border transition-colors";
const RAIL_ACTIVE = "border-signal/40 bg-signal-subtle text-signal";
const RAIL_IDLE =
  "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground";

const TOP_PORTALS = ["sms", "email", "audience", "developers"];

export function PortalRail({
  portals,
  activePortalId,
  isHome,
  onSelectPortal,
  user,
}: {
  portals: DashboardPortal[];
  activePortalId: string | null;
  isHome: boolean;
  onSelectPortal: (portal: DashboardPortal) => void;
  user: SessionUser;
}) {
  const topPortals = TOP_PORTALS.map((id) =>
    portals.find((p) => p.id === id),
  ).filter((portal): portal is DashboardPortal => portal !== undefined);
  const walletPortal = portals.find((p) => p.id === "wallet");
  const accountPortal = portals.find((p) => p.id === "account");
  const displayName = user.name.trim() || user.email;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <nav
      aria-label="Workspace"
      className="hidden h-full w-14 shrink-0 flex-col items-center gap-1.5 border-r bg-sidebar py-3 md:flex"
    >
      <Link
        href="/dashboard"
        aria-label="Dugble home"
        className="flex size-10 items-center justify-center rounded-xl transition-opacity hover:opacity-80"
      >
        <BrandMark size="md" />
      </Link>

      <div className="my-1 h-px w-6 bg-border" />

      <div className="mb-1">
        <TeamSwitcher />
      </div>

      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/dashboard"
              aria-label="Home"
              aria-current={isHome ? "page" : undefined}
              className={cn(RAIL_ITEM, isHome ? RAIL_ACTIVE : RAIL_IDLE)}
            />
          }
        >
          <Home className="size-4" />
        </TooltipTrigger>
        <TooltipContent side="right">Home</TooltipContent>
      </Tooltip>

      {topPortals.map((portal) => (
        <RailButton
          key={portal.id}
          portal={portal}
          active={activePortalId === portal.id}
          onClick={() => onSelectPortal(portal)}
        />
      ))}

      <div className="flex-1" />

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
                aria-current={
                  activePortalId === accountPortal.id ? "true" : undefined
                }
                onClick={() => onSelectPortal(accountPortal)}
                className={cn(
                  "mt-1 flex size-8 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                  activePortalId === accountPortal.id
                    ? "border-signal/50 bg-signal-subtle text-signal"
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
    </nav>
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
            aria-current={active ? "true" : undefined}
            onClick={onClick}
            className={cn(RAIL_ITEM, active ? RAIL_ACTIVE : RAIL_IDLE)}
          />
        }
      >
        <portal.icon className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="right">{portal.label}</TooltipContent>
    </Tooltip>
  );
}
