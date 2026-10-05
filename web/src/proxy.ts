// src/proxy.ts

import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { buildContentSecurityPolicy, createNonce } from "@/lib/security/csp";

/** Require a session; unauthenticated visitors are sent to /login?next=… */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/team-invitations",
  "/verify-email-change",
] as const;

/** Rendered dynamically anyway, so they get the strict nonce-based CSP too. */
const AUTH_PREFIXES = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const;

function matches(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Edge gate for authenticated areas + per-request CSP nonce.
 *
 * This is an *optimistic* check (cookie presence only) that avoids rendering
 * protected shells for anonymous users; the authoritative check is
 * `requireSession()` against the Go session store in each protected layout.
 * Marketing pages are deliberately untouched so they stay statically rendered
 * (they receive a static CSP from next.config.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = matches(pathname, PROTECTED_PREFIXES);
  const isAuth = matches(pathname, AUTH_PREFIXES);

  if (isProtected && !request.cookies.has(SESSION_COOKIE_NAME)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (!isProtected && !isAuth) {
    return NextResponse.next();
  }

  const nonce = createNonce();
  const csp = buildContentSecurityPolicy({
    nonce,
    isDev: process.env.NODE_ENV === "development",
  });

  // Next.js reads the nonce from the request CSP header and applies it to its
  // own scripts; root layouts read `x-nonce` for third-party inline scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  // Authenticated pages must never be stored by shared caches.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
      // Prefetches don't render HTML that needs a fresh nonce.
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
