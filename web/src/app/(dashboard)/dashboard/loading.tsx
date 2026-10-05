// src/app/(dashboard)/dashboard/loading.tsx

import { PageSkeleton } from "@/components/dashboard/shared/page-skeleton";

/** Streams immediately while the page's server work (session, prefetch) runs. */
export default function Loading() {
  return <PageSkeleton />;
}
