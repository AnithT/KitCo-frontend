export interface KitchenJwtPayload {
  sub: string;
  exp: number;
  email?: string;
  name?: string;
  kitchen_id?: string;
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  if (typeof atob === 'function') return atob(padded + padding);
  return Buffer.from(padded + padding, 'base64').toString('binary');
}

export function decodeJwt<T = KitchenJwtPayload>(token: string): T | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const json = decodeURIComponent(
      Array.from(base64UrlDecode(parts[1]))
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function getKitchenIdFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  return payload.kitchen_id ?? payload.sub ?? null;
}
