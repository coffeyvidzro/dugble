import { cn } from "@/lib/utils";

export type ChangelogTagType = "New" | "Improved" | "Fixed";

const toneClass: Record<ChangelogTagType, string> = {
  New: "bg-signal/15 text-signal",
  Improved: "bg-pending/15 text-pending",
  Fixed: "bg-muted text-muted-foreground",
};

export function ChangelogTag({ tag }: { tag: ChangelogTagType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
        toneClass[tag],
      )}
    >
      {tag}
    </span>
  );
}
