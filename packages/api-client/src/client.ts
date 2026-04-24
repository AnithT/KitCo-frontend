import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiError } from './errors.js';
import { InMemoryTokenStorage, type TokenStorage, type AuthTokens } from './storage.js';

export interface KitCoClientConfig {
  baseURL: string;
  storage?: TokenStorage;
  /**
   * Called after a successful token refresh so the host app can react
   * (e.g., persist tokens, update auth context).
   */
  onTokensRefreshed?: (tokens: AuthTokens) => void;
  /**
   * Called when auth fails terminally (refresh returned 401). Host app should
   * sign the user out and redirect to login.
   */
  onAuthFailure?: () => void;
  /** Extra headers merged onto every request. */
  defaultHeaders?: Record<string, string>;
  /** Request timeout in ms. Default 30s. */
  timeoutMs?: number;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export interface KitCoClient {
  readonly axios: AxiosInstance;
  readonly storage: TokenStorage;
  readonly baseURL: string;
  setTokens(tokens: AuthTokens): Promise<void>;
  clearTokens(): Promise<void>;
  getAccessToken(): Promise<string | null>;
}

export function createKitCoClient(config: KitCoClientConfig): KitCoClient {
  const storage = config.storage ?? new InMemoryTokenStorage();
  const timeoutMs = config.timeoutMs ?? 30_000;

  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: timeoutMs,
    headers: { 'Content-Type': 'application/json', ...(config.defaultHeaders ?? {}) },
  });

  instance.interceptors.request.use(async (req) => {
    const token = await Promise.resolve(storage.getAccessToken());
    if (token && !req.headers.Authorization) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  let refreshInFlight: Promise<AuthTokens> | null = null;

  async function refreshTokens(): Promise<AuthTokens> {
    if (refreshInFlight) return refreshInFlight;
    const refresh = await Promise.resolve(storage.getRefreshToken());
    if (!refresh) throw new Error('No refresh token');

    refreshInFlight = axios
      .post<AuthTokens>(
        '/api/v1/auth/refresh',
        { refresh_token: refresh },
        { baseURL: config.baseURL, timeout: timeoutMs },
      )
      .then(async (res) => {
        const tokens: AuthTokens = {
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token,
        };
        await Promise.resolve(storage.setTokens(tokens));
        config.onTokensRefreshed?.(tokens);
        return tokens;
      })
      .finally(() => {
        refreshInFlight = null;
      });

    return refreshInFlight;
  }

  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      const original = err.config as RetriableConfig | undefined;
      const status = err.response?.status;
      const isAuthEndpoint =
        typeof original?.url === 'string' && original.url.includes('/auth/');

      if (status === 401 && original && !original._retry && !isAuthEndpoint) {
        original._retry = true;
        try {
          const tokens = await refreshTokens();
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${tokens.access_token}`;
          return instance.request(original);
        } catch (refreshErr) {
          await Promise.resolve(storage.clear());
          config.onAuthFailure?.();
          return Promise.reject(ApiError.fromAxios(refreshErr));
        }
      }

      return Promise.reject(ApiError.fromAxios(err));
    },
  );

  return {
    axios: instance,
    storage,
    baseURL: config.baseURL,
    async setTokens(tokens) {
      await Promise.resolve(storage.setTokens(tokens));
    },
    async clearTokens() {
      await Promise.resolve(storage.clear());
    },
    async getAccessToken() {
      return Promise.resolve(storage.getAccessToken());
    },
  };
}

/**
 * Thin wrapper that unwraps AxiosResponse → data for the typed endpoint
 * functions. All endpoint modules use this rather than touching axios directly.
 */
export async function request<T>(
  client: KitCoClient,
  cfg: AxiosRequestConfig,
): Promise<T> {
  const res = await client.axios.request<T>(cfg);
  return res.data;
}
