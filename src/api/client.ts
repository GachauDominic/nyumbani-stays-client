const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
    if (typeof record.error === "string") return record.error; 
  }
  return fallback;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Could not reach the API at ${API_BASE_URL}. Is the backend running?`,
      0,
      null,
    );
  }

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    throw new ApiError(extractMessage(data, `Request failed with status ${res.status}`), res.status, data);
  }

  return data as T;
}

/** Many list endpoints on this backend 404 (with a message) instead of returning `[]` when empty. */
export async function fetchListOrEmpty<T>(path: string, options: RequestOptions = {}): Promise<T[]> {
  try {
    const result = await apiFetch<{ data: T[] } | T[]>(path, options);
    const data = Array.isArray(result) ? result : result.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}

/** For single-record lookups that also 404 with a message when missing. */
export async function fetchOneOrNull<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  try {
    const result = await apiFetch<{ data: T }>(path, options);
    return result.data ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
