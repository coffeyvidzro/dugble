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
      className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
      />
    </button>
  );
}
