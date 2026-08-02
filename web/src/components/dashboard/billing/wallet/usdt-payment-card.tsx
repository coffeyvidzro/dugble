import { QrCode } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { CopyField } from "./copy-field";

export function UsdtPaymentCard({ reference }: { reference: string }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={QrCode}
                title="USDT (Crypto)"
                description="Pay with USDT on the TRC20 network for near-instant settlement."
            />
            <CardContent className="space-y-3 pt-6">
                <div className="mx-auto flex size-28 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
                    <QrCode className="size-12 text-muted-foreground/50" />
                </div>
                <CopyField label="Network" value="USDT · TRC20" mono={false} />
                <CopyField
                    label="Wallet address"
                    value="Configure your USDT (TRC20) address"
                />
                <CopyField label="Payment reference" value={reference} />
                <p className="text-xs font-medium text-pending">
                    ⚠ Note: Crypto sent to the wrong address can&apos;t be
                    recovered and will be lost. Please double-check the wallet
                    address before sending any funds.
                </p>
            </CardContent>
        </Card>
    );
}
