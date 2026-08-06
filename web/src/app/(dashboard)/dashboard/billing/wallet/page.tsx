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

    return <WalletSettings />;
}
