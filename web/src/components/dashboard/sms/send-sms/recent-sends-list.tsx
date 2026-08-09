import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SmsStatusBadge } from "../sms-dashboard/sms-status-badge";
import { formatRelativeTime, getMockMessagePool } from "../sms-dashboard/types";

export function RecentSendsList() {
    const sends = getMockMessagePool().slice(5, 10);

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">Recently sent</CardTitle>
                <CardDescription>
                    One-off messages sent from this page.
                </CardDescription>
            </CardHeader>

            {sends.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    Nothing sent yet — your first message will show up here.
                </p>
            ) : (
                <ul className="divide-y divide-border/40">
                    {sends.map((send) => (
                        <li key={send.id}>
                            <Link
                                href={`/dashboard/sms/send/${send.id}`}
                                className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-mono text-sm text-foreground">
                                        <span className="mr-1.5">
                                            {send.countryFlag}
                                        </span>
                                        {send.to}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {send.body}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <SmsStatusBadge status={send.status} />
                                    <span className="hidden text-xs text-muted-foreground sm:inline">
                                        {formatRelativeTime(send.sentAt)}
                                    </span>
                                    <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
