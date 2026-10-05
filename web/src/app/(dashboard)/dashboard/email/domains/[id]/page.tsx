import { notFound } from "next/navigation";
import { DomainDetail } from "@/components/dashboard/email/domains/detail/domain-detail";
import { isUuid } from "@/lib/security/route-params";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Domain",
  description: "DNS configuration for a transactional email sending domain.",
  path: "/dashboard/email/domains",
  preset: "dashboard",
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isUuid(id)) notFound();

  return <DomainDetail domainId={id} />;
}
