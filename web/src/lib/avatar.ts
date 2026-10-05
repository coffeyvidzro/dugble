export function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_PALETTE = [
  "bg-primary/10 text-primary",
  "bg-signal/10 text-signal",
  "bg-pending/10 text-pending",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-5/25 text-chart-5",
] as const;

export function avatarStyle(seed: string): string {
  const hash = Array.from(seed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0];
}

export const TEAM_AVATAR_GRADIENT = "from-signal to-emerald-600";
