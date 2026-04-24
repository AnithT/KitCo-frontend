export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/**
 * Platform-agnostic token storage. The web app wires this to `localStorage`;
 * the mobile app wires it to `expo-secure-store`. Keeping both sync and async
 * return paths means the same client code works in both environments.
 */
export interface TokenStorage {
  getAccessToken(): Promise<string | null> | string | null;
  getRefreshToken(): Promise<string | null> | string | null;
  setTokens(tokens: AuthTokens): Promise<void> | void;
  clear(): Promise<void> | void;
}

/**
 * Fallback in-memory storage — useful in tests or SSR contexts where no
 * persistent store is available. NOT intended for production auth.
 */
export class InMemoryTokenStorage implements TokenStorage {
  private access: string | null = null;
  private refresh: string | null = null;

  getAccessToken(): string | null {
    return this.access;
  }

  getRefreshToken(): string | null {
    return this.refresh;
  }

  setTokens(tokens: AuthTokens): void {
    this.access = tokens.access_token;
    this.refresh = tokens.refresh_token;
  }

  clear(): void {
    this.access = null;
    this.refresh = null;
  }
}
