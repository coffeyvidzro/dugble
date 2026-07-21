type CSRFTokenResponse = {
  success?: unknown;
  data?: {
    csrf_token?: unknown;
  };
};

const CSRF_ENDPOINT = "/api/v1/csrf";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function getCSRFToken(): Promise<string> {
  const response = await fetch(CSRF_ENDPOINT, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token.");
  }

  const payload = (await response
    .json()
    .catch(() => null)) as CSRFTokenResponse | null;
  const token = payload?.data?.csrf_token;

  if (typeof token !== "string" || token.trim() === "") {
    throw new Error("Invalid CSRF token response.");
  }

  return token;
}

export async function csrfFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (unsafeMethods.has(method)) {
    const token = await getCSRFToken();
    headers.set("X-CSRF-Token", token);
  }

  return fetch(path, {
    ...init,
    method,
    credentials: "include",
    headers,
  });
}
