import type { ReactNode } from "react";

interface ShimmerPillButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export function ShimmerPillButton({
  onClick,
  children,
}: ShimmerPillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
    >
      {children}
    </button>
  );
}
