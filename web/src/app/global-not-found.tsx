import { RootDocument } from "@/components/layout/root-document";
import { NotFoundView } from "@/components/not-found-view";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Page not found",
  description: "The page you were looking for doesn't exist.",
  noIndex: true,
});

export default function GlobalNotFound() {
  return (
    <RootDocument>
      <NotFoundView />
    </RootDocument>
  );
}
