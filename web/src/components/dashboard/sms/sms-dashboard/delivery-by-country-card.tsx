import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { CountryDelivery } from "./types";

export function DeliveryByCountryCard({
    countries,
}: {
    countries: CountryDelivery[];
}) {
    const maxMessages = Math.max(...countries.map((c) => c.messages), 1);

    return (
        <Card className="h-full border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">Delivery by Country</CardTitle>
                <CardDescription>
                    Where your messages are landing this period.
                </CardDescription>
            </CardHeader>

            <div className="space-y-4 p-4">
                {countries.map((country) => (
                    <div key={country.country} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 font-medium text-foreground">
                                <span aria-hidden>{country.flag}</span>
                                {country.country}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                                {country.deliveryRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                            <div
                                className="h-full rounded-full bg-signal transition-all duration-500"
                                style={{
                                    width: `${(country.messages / maxMessages) * 100}%`,
                                }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {country.messages.toLocaleString()} messages
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
