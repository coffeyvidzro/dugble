// src/lib/security/csp.ts
//
// One Content-Security-Policy builder shared by `proxy.ts` (per-request nonce
// for authenticated/auth routes) and `next.config.ts` (static marketing pages).

type CspOptions = {
  /** Per-request nonce. When set, inline scripts must carry it (`strict-dynamic`). */
  nonce?: string;
  isDev: boolean;
};

export function buildContentSecurityPolicy({
  nonce,
  isDev,
}: CspOptions): string {
  const scriptSrc = nonce
    ? // Nonce + strict-dynamic: only scripts Next.js (or our code) explicitly
      // trusts can run; 'self' is a fallback for CSP2-only browsers.
      ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"]
    : // Static pages can't carry a per-request nonce; they handle no user data.
      ["'self'", "'unsafe-inline'"];
  if (isDev) scriptSrc.push("'unsafe-eval'"); // React dev tooling / HMR only.

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    // Tailwind + next/font emit inline styles and style attributes.
    "style-src": ["'self'", "'unsafe-inline'"],
    // `https:` so sandboxed email previews (srcdoc inherits this policy) can show images.
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    // The browser only talks to our origin; the API is proxied via /api/v1.
    "connect-src": isDev ? ["'self'", "ws:", "wss:"] : ["'self'"],
    "frame-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "manifest-src": ["'self'"],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

/** Cryptographically random, base64-encoded nonce (Edge- and Node-compatible). */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
