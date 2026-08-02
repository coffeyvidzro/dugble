import { Landmark } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { CopyField } from "./copy-field";

export function BankTransferCard({ reference }: { reference: string }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Landmark}
                title="Bank Transfer"
                description="Send USD or GHS from your bank and it'll reflect once confirmed."
            />
            <CardContent className="space-y-3 pt-6">
                <CopyField label="Bank name" value="GCB" />
                <CopyField
                    label="Account name"
                    value="Dugble Technologies Ltd"
                />
                <CopyField label="Account number" value="0123456789" />
                <CopyField label="SWIFT / BIC" value="GCBGH" />
                <CopyField label="Payment reference" value={reference} />
                <p className="text-xs text-muted-foreground/70">
                    Always include the payment reference so we can match your
                    transfer.
                </p>
            </CardContent>
        </Card>
    );
}
