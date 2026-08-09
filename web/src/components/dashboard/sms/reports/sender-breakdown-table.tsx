import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getSenderIdPool } from "../sender-ids/types";

export function SenderBreakdownTable() {
    const senders = getSenderIdPool()
        .filter((sender) => sender.status === "approved")
        .sort((a, b) => b.messagesSent - a.messagesSent)
        .slice(0, 6);

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">By Sender ID</CardTitle>
                <CardDescription>
                    Volume sent from each approved sender.
                </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead>Sender</TableHead>
                            <TableHead className="text-right">Messages</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {senders.map((sender) => (
                            <TableRow
                                key={sender.id}
                                className="border-b border-border/40 last:border-0"
                            >
                                <TableCell className="font-mono text-sm text-foreground">
                                    <span className="mr-1.5">{sender.flag}</span>
                                    {sender.name}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                                    {sender.messagesSent.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
