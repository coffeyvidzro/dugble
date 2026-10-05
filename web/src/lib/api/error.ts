export type ApiErrorOptions = {
  code?: string;
  fields?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: Record<string, string[]>;

  constructor(message: string, status: number, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code;
    this.fields = options.fields;
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 422 && Boolean(this.fields);
  }

  get isValidationMismatch(): boolean {
    return this.code === "invalid_response";
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super(
      "Unable to reach the Dugble API. Check your connection and try again.",
    );
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let payload: unknown = null;

  try {
    payload = await response.clone().json();
  } catch {}

  const message =
    extractErrorMessage(payload) ??
    response.statusText ??
    `Request failed with status ${response.status}.`;

  return new ApiError(message, response.status, {
    code: extractErrorCode(payload),
    fields: extractFieldErrors(payload),
  });
}

function asRecord(payload: unknown): Record<string, unknown> | undefined {
  return payload && typeof payload === "object"
    ? (payload as Record<string, unknown>)
    : undefined;
}

function extractErrorMessage(payload: unknown): string | undefined {
  const root = asRecord(payload);
  if (!root) return undefined;

  if (typeof root.message === "string") return root.message;
  if (typeof root.error === "string") return root.error;

  const nestedError = asRecord(root.error);
  if (nestedError && typeof nestedError.message === "string") {
    return nestedError.message;
  }

  return undefined;
}

function extractErrorCode(payload: unknown): string | undefined {
  const root = asRecord(payload);
  if (!root) return undefined;

  if (typeof root.code === "string") return root.code;

  const nestedError = asRecord(root.error);
  if (nestedError && typeof nestedError.code === "string") {
    return nestedError.code;
  }

  return undefined;
}

function extractFieldErrors(
  payload: unknown,
): Record<string, string[]> | undefined {
  const root = asRecord(payload);
  const fields = root?.fields;
  return fields && typeof fields === "object"
    ? (fields as Record<string, string[]>)
    : undefined;
}
