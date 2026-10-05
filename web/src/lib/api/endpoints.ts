// src/lib/api/endpoints.ts
//
// Isomorphic path builders shared by client hooks and server prefetching, so a
// prefetched query and its client counterpart always hit the same URL.

import type { WalletLedgerParams } from "@/types/billing-api";
import type { TeamsQueryParams } from "@/types/team";

function withQuery(
  path: string,
  params: Record<string, string | number | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== 0) {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export const endpoints = {
  teams: (params: TeamsQueryParams) =>
    withQuery("/teams", {
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
    }),
  walletLedger: (params: WalletLedgerParams) =>
    withQuery("/wallet/ledger", { limit: params.limit, offset: params.offset }),
} as const;

/** Page size of the team switcher's list — shared so the prefetch key matches. */
export const TEAM_SWITCHER_PARAMS = {
  page: 1,
  limit: 50,
} as const satisfies TeamsQueryParams;

/** First page of the wallet ledger as rendered by the wallet page. */
export const WALLET_LEDGER_FIRST_PAGE = {
  limit: 25,
  offset: 0,
} as const satisfies WalletLedgerParams;
