import { constructMetadata } from "@/utils/metadata";
import { MessageDetail } from "@/components/dashboard/sms/send-sms/message-detail";
import { getMessageById } from "@/components/dashboard/sms/send-sms/types";

export const metadata = constructMetadata({
    title: "Message",
    description: "Delivery status for a sent SMS message.",
    path: "/dashboard/sms/send",
    preset: "dashboard",
});

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ live?: string }>;
}) {
    const { id } = await params;
    const { live } = await searchParams;

    const message = getMessageById(id);

    return <MessageDetail message={message} isLive={live === "1"} />;
}
