import { ApiTokensPage } from "@/components/dashboard/developers/api-tokens-page";
import { requireSession } from "@/lib/session";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "API tokens",
  description: "Create, scope, and revoke API tokens for your Dugble team.",
  path: "/dashboard/developers/api-tokens",
  preset: "dashboard",
});

export default async function Page() {
  await requireSession();

  return <ApiTokensPage />;
}
