import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Gauge,
    KeyRound,
    MessagesSquare,
    XCircle,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
    title: "Overview",
    description:
        "Launch your messaging workspace, create API keys, and prepare your first customer notification flow.",
};

const quickStart = [
    {
        title: "Create workspace",
        href: "/dashboard/settings",
    },
    {
        title: "Generate API key",
        href: "/dashboard/api-keys",
    },
    {
        title: "Send test email",
        href: "/dashboard/messages/email",
    },
    {
        title: "Send test SMS",
        href: "/dashboard/messages/sms",
    },
    {
        title: "Configure webhook",
        href: "/dashboard/webhooks",
    },
];

const stats = [
    {
        label: "Messages sent today",
        value: "0",
        icon: MessagesSquare,
    },
    {
        label: "Delivery rate",
        value: "—",
        icon: Gauge,
    },
    {
        label: "Failed messages",
        value: "0",
        icon: XCircle,
    },
    {
        label: "API keys active",
        value: "0",
        icon: KeyRound,
    },
];

export default async function Page() {
    const session = await requireSession();
    const displayName = session.user.name.trim() || session.user.email;
    const completed = 0;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div>
                <p className="text-muted-foreground text-sm">Overview</p>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    Welcome back, {displayName}
                </h1>
                <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
                    Launch your messaging workspace, create API keys, and
                    prepare your first customer notification flow.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card
                        key={stat.label}
                        size="sm"
                        className="animate-fade-up"
                        style={{ animationDelay: `${i * 60}ms` }}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardDescription>{stat.label}</CardDescription>
                                <div className="flex size-7 items-center justify-center rounded-md border bg-background text-muted-foreground">
                                    <stat.icon className="size-3.5" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">
                                {stat.value}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Quick start</CardTitle>
                            <span className="font-mono text-xs text-muted-foreground">
                                {completed} of {quickStart.length} complete
                            </span>
                        </div>
                        <CardDescription>
                            Complete these steps to send your first Dugble
                            message.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {quickStart.map((item) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.href}
                                        className="group flex items-center gap-3 rounded-2xl border p-3 text-sm transition-colors hover:border-signal/40"
                                    >
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md border text-muted-foreground text-xs">
                                            □
                                        </span>
                                        <span className="flex-1">
                                            {item.title}
                                        </span>
                                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Recent activity</CardTitle>
                        <CardDescription>
                            Message and workspace events will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-4 border-y bg-muted/20 px-4 py-2 font-mono text-[11px] text-muted-foreground">
                            <span>Message</span>
                            <span>Channel</span>
                            <span>Status</span>
                            <span className="text-right">Time</span>
                        </div>
                        <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                            <p className="text-sm font-medium">
                                No messages yet
                            </p>
                            <p className="max-w-56 text-xs text-muted-foreground">
                                Send a test message to see it traced here in
                                real time.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
