export function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 py-1.5 pl-2.5 pr-3.5 text-xs font-medium text-muted-foreground">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-signal" />
      </span>
      <span className="tracking-wide">Now in public beta</span>
      <span className="h-3 w-px bg-border" />
      <span className="font-mono text-[11px] text-foreground/80">v1 API</span>
    </div>
  );
}
