import { TemplatesProvider } from "@/components/dashboard/email/templates/templates-store";

export default function TemplatesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <TemplatesProvider>{children}</TemplatesProvider>;
}
