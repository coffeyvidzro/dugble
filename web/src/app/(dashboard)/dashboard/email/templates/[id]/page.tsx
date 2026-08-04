import { TemplateEditorLoader } from "@/components/dashboard/email/templates/editor/template-editor-loader";
import { getTemplateById } from "@/components/dashboard/email/templates/types";
import { constructMetadata } from "@/utils/metadata";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const template = getTemplateById(id);

    return constructMetadata({
        title: template ? template.name : "Template",
        description:
            template?.description ?? "Edit a transactional email template.",
        path: `/dashboard/email/templates/${id}`,
        preset: "dashboard",
    });
}

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-2">
            <TemplateEditorLoader id={id} />
        </div>
    );
}
