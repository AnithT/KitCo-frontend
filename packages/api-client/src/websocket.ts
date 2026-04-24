import type { OrderOut, UUID } from './types.js';

export type KitchenWSEvent =
  | { type: 'order.new'; order: OrderOut }
  | { type: 'order.updated'; order: OrderOut }
  | { type: 'ping' }
  | { type: string; [key: string]: unknown };

export type OrderWSEvent =
  | { type: 'order.updated'; order: OrderOut }
  | { type: 'order.status_changed'; order: OrderOut }
  | { type: 'ping' }
  | { type: string; [key: string]: unknown };

export interface WSHandlers<TEvent> {
  onOpen?: (ev: Event) => void;
  onMessage?: (event: TEvent) => void;
  onError?: (ev: Event) => void;
  onClose?: (ev: CloseEvent) => void;
}

export interface WSOptions {
  /**
   * Optional access token. When provided it's appended as `?token=<jwt>` —
   * useful for the kitchen console once the backend wires auth into the
   * WebSocket handshake.
   */
  token?: string;
  /** Extra query params to include. */
  params?: Record<string, string>;
}

export interface KitCoSocket<TEvent> {
  readonly socket: WebSocket;
  send(data: unknown): void;
  close(code?: number, reason?: string): void;
}

function toWSBase(httpBase: string): string {
  if (httpBase.startsWith('https://')) return 'wss://' + httpBase.slice('https://'.length);
  if (httpBase.startsWith('http://')) return 'ws://' + httpBase.slice('http://'.length);
  return httpBase;
}

function buildURL(
  baseURL: string,
  path: string,
  opts: WSOptions | undefined,
): string {
  const root = toWSBase(baseURL).replace(/\/$/, '');
  const url = new URL(root + path);
  if (opts?.token) url.searchParams.set('token', opts.token);
  if (opts?.params) {
    for (const [k, v] of Object.entries(opts.params)) url.searchParams.set(k, v);
  }
  return url.toString();
}

function open<TEvent>(
  url: string,
  handlers: WSHandlers<TEvent>,
): KitCoSocket<TEvent> {
  const ws = new WebSocket(url);

  if (handlers.onOpen) ws.addEventListener('open', handlers.onOpen);
  if (handlers.onError) ws.addEventListener('error', handlers.onError);
  if (handlers.onClose) ws.addEventListener('close', handlers.onClose);

  ws.addEventListener('message', (ev) => {
    if (!handlers.onMessage) return;
    try {
      const parsed = JSON.parse(ev.data) as TEvent;
      handlers.onMessage(parsed);
    } catch {
      handlers.onMessage({ type: 'raw', data: ev.data } as unknown as TEvent);
    }
  });

  return {
    socket: ws,
    send(data) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      ws.send(payload);
    },
    close(code, reason) {
      ws.close(code, reason);
    },
  };
}

export function createKitchenSocket(
  baseURL: string,
  kitchenId: UUID,
  handlers: WSHandlers<KitchenWSEvent>,
  options?: WSOptions,
): KitCoSocket<KitchenWSEvent> {
  return open<KitchenWSEvent>(
    buildURL(baseURL, `/ws/kitchen/${kitchenId}`, options),
    handlers,
  );
}

export function createOrderSocket(
  baseURL: string,
  orderId: UUID,
  handlers: WSHandlers<OrderWSEvent>,
  options?: WSOptions,
): KitCoSocket<OrderWSEvent> {
  return open<OrderWSEvent>(
    buildURL(baseURL, `/ws/order/${orderId}`, options),
    handlers,
  );
}
