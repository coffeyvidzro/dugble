import { Wallet as WalletIcon } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function WalletHeader() {
  return (
    <PortalHeroHeader
      breadcrumb="Billing / Wallet"
      title="Wallet"
      description="Fund your workspace balance and review every credit and debit."
      badge={
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-signal" />
          </span>
          <WalletIcon className="size-3.5" />
          Live balance
        </>
      }
    />
  );
}
