import Link from "next/link";
import { AlertTriangle, CalendarClock, KeyRound, Receipt } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MESSAGE_TEMPLATES, type MessageTemplateId } from "../../shared/message-templates";

const TEMPLATE_ICONS: Record<MessageTemplateId, typeof KeyRound> = {
    otp: KeyRound,
    receipt: Receipt,
    alert: AlertTriangle,
    reminder: CalendarClock,
};

export function MessageTemplatesGrid() {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">Start from a template</CardTitle>
                <CardDescription>
                    Common message types, prefilled and ready to edit.
                </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                {MESSAGE_TEMPLATES.map((template) => {
                    const Icon = TEMPLATE_ICONS[template.id];
                    return (
                        <Link
                            key={template.id}
                            href={`/dashboard/sms/send/new?template=${template.id}`}
                            className="group flex flex-col gap-2 rounded-lg border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <span className="flex size-8 items-center justify-center rounded-md bg-muted/60 text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon className="size-4" />
                                </span>
                                <span className="font-medium text-foreground">
                                    {template.label}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {template.description}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </Card>
    );
}
