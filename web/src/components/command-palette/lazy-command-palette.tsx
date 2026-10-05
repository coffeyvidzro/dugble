"use client";

import dynamic from "next/dynamic";

export const LazyCommandPalette = dynamic(
  () => import("./command-palette").then((mod) => mod.CommandPalette),
  { ssr: false },
);
