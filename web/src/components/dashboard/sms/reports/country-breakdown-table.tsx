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
import type { CountryDelivery } from "../sms-dashboard/types";

export function CountryBreakdownTable({ countries }: { countries: CountryDelivery[] }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">By Country</CardTitle>
                <CardDescription>Delivery performance by destination.</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead>Country</TableHead>
                            <TableHead className="text-right">Messages</TableHead>
                            <TableHead className="text-right">Delivery rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {countries.map((country) => (
                            <TableRow
                                key={country.country}
                                className="border-b border-border/40 last:border-0"
                            >
                                <TableCell className="text-sm text-foreground">
                                    <span className="mr-1.5">{country.flag}</span>
                                    {country.country}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                                    {country.messages.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm text-foreground">
                                    {country.deliveryRate.toFixed(1)}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
