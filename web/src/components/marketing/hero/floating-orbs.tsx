export function FloatingOrbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -top-24 right-10 size-104 rounded-full bg-signal/[0.14] blur-[110px] animate-orb-drift-a" />
      <div className="absolute -bottom-24 left-[10%] size-88 rounded-full bg-pending/10 blur-[100px] animate-orb-drift-b" />
    </div>
  );
}
