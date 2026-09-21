// Lightweight helper to peek at a JWT's payload on the client.
// This never verifies the signature - it only reads `exp` so the UI
// can proactively log the user out instead of waiting for a 401.

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

export function isTokenExpired(token: string): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return false;
  return Date.now() >= expiryMs;
}
