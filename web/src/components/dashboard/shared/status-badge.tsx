import { AlertTriangle, type LucideIcon, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Five tones cover every status in the product:
 * - success:  delivered, verified, approved, active
 * - progress: queued, processing, submitted, scheduled, pending
 * - warning:  delayed, partially verified, failing, expiring
 * - danger:   failed, bounced, rejected, undelivered, expired
 * - neutral:  draft, canceled, disabled, inactive, unknown
 *
 * Labels stay in the text color; the tone lives on the mark, fill and
 * border (amber text on white fails WCAG AA at 12px).
 */
export type StatusTone =
  | "success"
  | "progress"
  | "warning"
  | "danger"
  | "neutral";

const PILL_TONE: Record<StatusTone, string> = {
  success: "border-signal/30 bg-signal-subtle",
  progress: "border-pending/30 bg-pending-subtle",
  warning: "border-pending/30 bg-pending-subtle",
  danger: "border-danger/30 bg-danger-subtle",
  neutral: "border-border bg-muted",
};

const MARK_COLOR: Record<StatusTone, string> = {
  success: "bg-signal",
  progress: "bg-pending",
  warning: "text-pending",
  danger: "text-danger",
  neutral: "border-muted-foreground",
};

const DEFAULT_ICON: Partial<Record<StatusTone, LucideIcon>> = {
  warning: AlertTriangle,
  danger: X,
};

export function StatusBadge({
  tone,
  children,
  icon,
  live = false,
  size = "sm",
  variant = "pill",
  title,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  /** Overrides the tone's default mark (warning/danger use an icon). */
  icon?: LucideIcon;
  /** Pulse the mark. Only for objects that are actually being polled. */
  live?: boolean;
  size?: "sm" | "md";
  /** `inline` drops the pill container, for use inside sentences. */
  variant?: "pill" | "inline";
  title?: string;
  className?: string;
}) {
  const Icon = icon ?? DEFAULT_ICON[tone];
  const dotSize = size === "md" ? "size-[7px]" : "size-1.5";

  const mark = Icon ? (
    <Icon
      aria-hidden
      strokeWidth={2.75}
      className={cn(
        "shrink-0",
        size === "md" ? "size-3.5" : "size-3",
        MARK_COLOR[tone],
      )}
    />
  ) : tone === "neutral" ? (
    <span
      aria-hidden
      className={cn(
        "shrink-0 rounded-full border-[1.5px]",
        dotSize,
        MARK_COLOR.neutral,
      )}
    />
  ) : (
    <span aria-hidden className={cn("relative flex shrink-0", dotSize)}>
      {live && (
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-60",
            MARK_COLOR[tone],
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex size-full rounded-full",
          MARK_COLOR[tone],
        )}
      />
    </span>
  );

  return (
    <span
      title={title}
      data-tone={tone}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 font-medium whitespace-nowrap text-foreground transition-colors duration-200",
        variant === "pill" && [
          "rounded-full border",
          size === "md"
            ? "h-[26px] px-2.5 text-[13px]"
            : "h-[22px] px-2 text-xs",
          PILL_TONE[tone],
        ],
        variant === "inline" && (size === "md" ? "text-sm" : "text-[13px]"),
        className,
      )}
    >
      {mark}
      {children}
    </span>
  );
}

const DOT_COLOR: Record<StatusTone, string> = {
  success: "bg-signal",
  progress: "bg-pending",
  warning: "bg-pending",
  danger: "bg-danger",
  neutral: "border-[1.5px] border-muted-foreground",
};

/** Bare tone dot, for filter menus and legends. */
export function StatusDot({ tone }: { tone: StatusTone }) {
  return (
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full", DOT_COLOR[tone])}
    />
  );
}
