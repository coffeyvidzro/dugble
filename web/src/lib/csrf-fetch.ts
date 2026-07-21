const CSRF_COOKIE_NAME = "dugble_csrf";
const CSRF_ENDPOINT = "/api/v1/csrf";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

function requestMethod(init: RequestInit): string {
  return (init.method ?? "GET").toUpperCase();
}

function requiresCsrfToken(init: RequestInit): boolean {
  return !SAFE_METHODS.has(requestMethod(init));
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(encodedName));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(encodedName.length));
}

async function fetchCsrfToken(): Promise<string> {
  const response = await fetch(CSRF_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch CSRF token (${response.status}).`);
  }

  const payload: unknown = await response.json().catch(() => null);
  const token =
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    typeof payload.data === "object" &&
    payload.data !== null &&
    "csrf_token" in payload.data &&
    typeof payload.data.csrf_token === "string"
      ? payload.data.csrf_token
      : readCookie(CSRF_COOKIE_NAME);

  if (!token || token.trim() === "") {
    throw new Error(`Missing CSRF token cookie (${CSRF_COOKIE_NAME}).`);
  }

  return token;
}

export async function getCsrfToken(): Promise<string> {
  const token = readCookie(CSRF_COOKIE_NAME);

  if (token && token.trim() !== "") {
    return token;
  }

  return fetchCsrfToken();
}

export async function csrfFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);

  if (requiresCsrfToken(init)) {
    headers.set("X-CSRF-Token", await getCsrfToken());
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "same-origin",
  });
}
