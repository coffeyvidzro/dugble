import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { LogTableRow } from "./log-table-row";
import type { LogEntry } from "./types";

export function LogTable({ logs }: { logs: LogEntry[] }) {
    return (
        <Card className="hidden overflow-hidden border-border/40 shadow-sm md:block">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead className="w-24">Time</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="w-24 text-right">
                                Latency
                            </TableHead>
                            <TableHead className="w-10 text-right" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <LogTableRow key={log.id} log={log} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
