import { TemplateNotFound } from "@/components/dashboard/email/templates/editor/template-not-found";

export default function NotFound() {
    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-8">
            <TemplateNotFound />
        </div>
    );
}
