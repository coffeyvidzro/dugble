import { WalletSettings } from "@/components/dashboard/billing/wallet/wallet-settings";
import { PrefetchBoundary } from "@/components/providers/prefetch-boundary";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Wallet",
  description: "Review workspace wallet balance and top-ups.",
  path: "/dashboard/billing/wallet",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PrefetchBoundary queries={["wallet", "walletLedgerFirstPage"]}>
      <WalletSettings />
    </PrefetchBoundary>
  );
}
