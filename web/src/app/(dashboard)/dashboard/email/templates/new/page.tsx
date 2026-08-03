import { TemplateEditor } from "@/components/dashboard/email/templates/editor/template-editor";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "New Template",
    description: "Create a new transactional email template.",
    path: "/dashboard/email/templates/new",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-8">
            <TemplateEditor mode="create" />
        </div>
    );
}
