import { Reveal } from "@/components/marketing/reveal";

const rows = [
    {
        id: "msg_7ac931",
        to: "+233 55 •••• 12",
        channel: "SMS",
        status: "delivered",
        time: "0.4s ago",
    },
    {
        id: "msg_7ac928",
        to: "coffrey@vidzro.com",
        channel: "Email",
        status: "delivered",
        time: "2s ago",
    },
    {
        id: "msg_7ac914",
        to: "+233 548 •••• 49",
        channel: "SMS",
        status: "sent",
        time: "6s ago",
    },
    {
        id: "msg_7ac902",
        to: "prosper@kessie.io",
        channel: "Email",
        status: "queued",
        time: "9s ago",
    },
    {
        id: "msg_7ac887",
        to: "+233 24 •••• 40",
        channel: "SMS",
        status: "failed",
        time: "14s ago",
    },
];

const statusStyles: Record<string, string> = {
    delivered: "bg-signal/15 text-signal",
    sent: "bg-foreground/10 text-foreground",
    queued: "bg-pending/15 text-pending",
    failed: "bg-danger/15 text-danger",
};

export function DashboardPreview() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    From the dashboard
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Every message, searchable the moment it moves.
                </h2>
            </Reveal>

            <Reveal
                delay={150}
                className="overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/30"
            >
                <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
                    <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-danger/70" />
                        <span className="size-2.5 rounded-full bg-pending/70" />
                        <span className="size-2.5 rounded-full bg-signal/70" />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                        dashboard.dugble.com/logs
                    </span>
                    <span className="w-12" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-140 text-left text-sm">
                        <thead>
                            <tr className="border-b text-xs text-muted-foreground">
                                <th className="px-5 py-3 font-medium">
                                    Message
                                </th>
                                <th className="px-5 py-3 font-medium">To</th>
                                <th className="px-5 py-3 font-medium">
                                    Channel
                                </th>
                                <th className="px-5 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-right font-medium">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/20"
                                >
                                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                                        {row.id}
                                    </td>
                                    <td className="px-5 py-3 font-mono text-xs">
                                        {row.to}
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground">
                                        {row.channel}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={`rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${statusStyles[row.status]}`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground">
                                        {row.time}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Reveal>
        </section>
    );
}
