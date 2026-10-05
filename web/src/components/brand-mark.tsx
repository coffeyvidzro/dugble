// src/components/brand-mark.tsx

import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { px: 28, className: "size-7 rounded-lg" },
  md: { px: 32, className: "size-8 rounded-xl" },
} as const;

/**
 * Dugble mark with light/dark variants swapped by CSS (no hydration flash).
 * Decorative: the surrounding link or tooltip carries the accessible name.
 */
export function BrandMark({ size = "md" }: { size?: keyof typeof SIZES }) {
  const { px, className } = SIZES[size];
  return (
    <>
      <Image
        src="/brand/mark-light-bg.svg"
        alt=""
        width={px}
        height={px}
        className={cn(className, "dark:hidden")}
      />
      <Image
        src="/brand/mark-dark-bg.svg"
        alt=""
        width={px}
        height={px}
        className={cn(className, "hidden dark:block")}
      />
    </>
  );
}
