import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CodeTabs } from "./code-tabs";

export function QuickstartCard() {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">Send your first SMS</CardTitle>
                <CardDescription>
                    Pick your language and drop this into your backend
                    you&apos;re sending in minutes.
                </CardDescription>
            </CardHeader>
            <div className="p-4">
                <CodeTabs />
            </div>
        </Card>
    );
}
