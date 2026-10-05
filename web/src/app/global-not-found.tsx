// src/app/global-not-found.tsx

import { RootDocument } from "@/components/layout/root-document";
import { NotFoundView } from "@/components/not-found-view";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Page not found",
  description: "The page you were looking for doesn't exist.",
  noIndex: true,
});

/** 404 for URLs that match no route group (each group owns its root layout). */
export default function GlobalNotFound() {
  return (
    <RootDocument>
      <NotFoundView />
    </RootDocument>
  );
}
