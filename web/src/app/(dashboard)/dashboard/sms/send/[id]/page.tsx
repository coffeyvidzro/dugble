import { notFound } from "next/navigation";
import { MessageDetail } from "@/components/dashboard/sms/send-sms/message-detail";
import { isUuid } from "@/lib/security/route-params";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Message",
  description: "Delivery status for a sent SMS message.",
  path: "/dashboard/sms/send",
  preset: "dashboard",
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isUuid(id)) notFound();

  return <MessageDetail messageId={id} />;
}
