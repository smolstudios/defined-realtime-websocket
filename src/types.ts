interface Authorization {
  host: string;
  Authorization: string;
}

interface Extensions {
  authorization: Authorization;
}

interface WebSocketSubscriptionRequestPayload {
  data: string;
  extensions: Extensions;
}

export interface WebSocketSubscriptionRequest {
  id: string;
  payload: WebSocketSubscriptionRequestPayload;
  type: string;
}

export interface Sink<T = unknown> {
  /** Next value arriving. */
  next(value: T): void;
  /**
   * An error that has occured. Calling this function "closes" the sink.
   * Besides the errors being `Error` and `readonly GraphQLError[]`, it
   * can also be a `CloseEvent`, but to avoid bundling DOM typings because
   * the client can run in Node env too, you should assert the close event
   * type during implementation.
   */
  error?(error: unknown): void;
  /** The sink has completed. This function "closes" the sink. */
  complete?(): void;
}

export interface WebSocketFactory {
  new (url: string | URL, protocols?: string | string[] | undefined): WebSocket;
  prototype: WebSocket;
  readonly CLOSED: number;
  readonly CLOSING: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
}

export interface DefinedWebSocketDataPayload<T> {
  data: T;
  errors?: Array<any>;
}

export interface DefinedWebSocketSubscriptionResponse<T> {
  id: string;
  type: 'data' | 'start_ack' | 'error' | 'ka' | 'complete';
  payload: DefinedWebSocketDataPayload<T>;
}

export interface SubscribeToNftSalesParams {
  contractAddress?: string;
  chainId?: string | number;
}

export interface SubscribeToTokenPriceParams {
  contractAddress?: string;
  chainId?: string | number;
}

export interface SubscribeToTokenChartParams {
  // Can specify _either_  specific contractAddress or pairAddress (e.g. uniswap pool address)
  contractAddressOrPaidAddress: string;
  chainId: string | number;
}

export interface SubscribeToTokenSwapParams {
  // Can specify _either_  specific contractAddress or pairAddress (e.g. uniswap pool address)
  contractAddressOrPaidAddress: string;
  chainId: string | number;
}

/**
 *
 *
 */
