import { LogDetailView } from "@/components/dashboard/email/logs/detail/log-detail-view";
import { getLogById } from "@/components/dashboard/email/logs/types";
import { constructMetadata } from "@/utils/metadata";
import { notFound } from "next/navigation";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const log = getLogById(id);

    return constructMetadata({
        title: log ? `${log.subject} · Log` : "Log",
        description: log
            ? `Delivery log for a message sent to ${log.to}.`
            : "Inspect a transactional email delivery log.",
        path: `/dashboard/email/logs/${id}`,
        preset: "dashboard",
    });
}

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const log = getLogById(id);

    if (!log) {
        notFound();
    }

    return <LogDetailView log={log} />;
}
