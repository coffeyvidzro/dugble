import { constructMetadata } from "@/utils/metadata";
import { ComposeHeader } from "@/components/dashboard/sms/send-sms/compose-header";
import { ComposeSmsForm } from "@/components/dashboard/sms/send-sms/compose-sms-form";
import { getTemplateById } from "@/components/dashboard/shared/message-templates";

export const metadata = constructMetadata({
    title: "New Message",
    description: "Compose and send a new SMS message.",
    path: "/dashboard/sms/send/new",
    preset: "dashboard",
});

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ template?: string }>;
}) {
    const { template } = await searchParams;
    const initialTemplate = getTemplateById(template);

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <ComposeHeader />
            <ComposeSmsForm initialTemplate={initialTemplate} />
        </div>
    );
}
