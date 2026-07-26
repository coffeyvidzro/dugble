import Link from "next/link";

import { cn } from "@/lib/utils";

type TerminalLinkProps = {
  href: string;
  children: React.ReactNode;
  size?: "default" | "lg";
  className?: string;
  truncateLabel?: boolean;
};

export function TerminalLink({
  href,
  children,
  size = "default",
  className,
  truncateLabel = false,
}: TerminalLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group/button relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20",
        size === "lg" ? "h-11" : "h-10",
        className,
      )}
    >
      <span className="text-signal">$</span>
      {truncateLabel ? <span className="truncate">{children}</span> : children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
      />
    </Link>
  );
}
