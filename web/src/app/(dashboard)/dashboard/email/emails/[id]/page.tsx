import { notFound } from "next/navigation";
import { EmailDetailView } from "@/components/dashboard/email/emails-page/detail/email-detail-view";
import { isUuid } from "@/lib/security/route-params";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Email",
  description: "Delivery status and content for a sent email.",
  path: "/dashboard/email/emails",
  preset: "dashboard",
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isUuid(id)) notFound();

  return <EmailDetailView emailId={id} />;
}
