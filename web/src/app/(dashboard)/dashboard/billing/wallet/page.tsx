import { WalletSettings } from "@/components/dashboard/billing/wallet/wallet-settings";
import { constructMetadata } from "@/utils/metadata";
import { requireSession } from "@/lib/session";

export const metadata = constructMetadata({
    title: "Wallet",
    description: "Review workspace wallet balance and top-ups.",
    path: "/dashboard/billing/wallet",
    preset: "dashboard",
});

export default async function Page() {
    await requireSession();

    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-8">
            <WalletSettings />
        </div>
    );
}
