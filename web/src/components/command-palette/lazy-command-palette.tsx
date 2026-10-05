// src/components/command-palette/lazy-command-palette.tsx

"use client";

import dynamic from "next/dynamic";

/**
 * The palette (and its route index, which pulls in the marketing changelog and
 * dashboard nav) is split into its own chunk and loaded after hydration, so it
 * no longer weighs on every page's initial JS. It renders nothing until opened.
 */
export const LazyCommandPalette = dynamic(
  () => import("./command-palette").then((mod) => mod.CommandPalette),
  { ssr: false },
);
