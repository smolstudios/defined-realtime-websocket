import { v4 as uuidv4 } from 'uuid';
import {
  encodeApiKeyToWebsocketAuthHeader,
  getDefinedWsWebsocketUrl,
  getIsomorphicWebSocket,
} from './util';
import {
  DefinedWebSocketOnCreatedNftEventsSubscriptionData,
  DefinedWebSocketTokenChartData,
  DefinedWebSocketTokenPricingData,
  DefinedWebSocketTokenSwapData,
  getDefinedErc20TokenChartUpdateGql,
  getDefinedErc20TokenPriceUpdateGql,
  getDefinedErc20TokenSwapUpdateGql,
  getDefinedNftSaleSubscriptionGql,
} from './gql';
import type {
  DefinedWebSocketSubscriptionResponse,
  Sink,
  SubscribeToNftSalesParams,
  SubscribeToTokenChartParams,
  SubscribeToTokenPriceParams,
  SubscribeToTokenSwapParams,
  WebSocketFactory,
  WebSocketSubscriptionRequest,
} from './types';
import { invariant } from './invariant';
import { DEFAULT_HOST_URI, WS_TRANSPORT_PROTOCOL } from './constants';

// TODO(johnrjj) - Minimum Viable Interace
type IWebSocket = WebSocket;

/**
 * Optional configuration options for DefinedRealtimeClient
 */
interface DefinedRealtimeClientConfig {
  hostUrl?: string;
  // lazy load is true by default
  lazyLoadWebSocketConnection?: boolean;
}

/**
 * Defined Realtime WebSocket client
 * Use this to listen to realtime data from defined.fi
 * Visit realtime docs at https://docs.defined.fi/websockets
 */
class DefinedRealtimeClient {
  private wsFactory: WebSocketFactory;
  private hostUrl: string = DEFAULT_HOST_URI;
  public wsLazySingleton: IWebSocket | undefined; // TODO(johnrjj) - Lazy load

  constructor(private apiKey: string, config?: DefinedRealtimeClientConfig) {
    invariant(this.apiKey, 'DEFINED_API_KEY cannot be null');
    this.wsFactory = getIsomorphicWebSocket();
    if (config?.lazyLoadWebSocketConnection === false) {
      this._initDefinedFiWebSocket();
    }
    if (config?.hostUrl) {
      this.hostUrl = config.hostUrl;
    }
  }

  getWebSocketUrl = () => {
    const apiKey = this.apiKey;
    const headerQueryParm = encodeApiKeyToWebsocketAuthHeader(apiKey);
    const wsUrl = getDefinedWsWebsocketUrl(headerQueryParm);
    return wsUrl;
  };

  /**
   * Disconnects the websocket and all active subscription
   * @returns
   */
  public disconnect = async (): Promise<boolean> => {
    // Possible states we can be in when we call this fn:
    // No websocket, a connected websocket we need to disconnect, or an already disconnected websocket
    return new Promise((resolve) => {
      // No websocket, nothing to close...
      if (!this.wsLazySingleton) {
        return resolve(true);
      }
      // Close and wait for confirmation
      this.wsLazySingleton?.close();
      if (this.wsLazySingleton?.readyState !== 3) {
        this.wsLazySingleton?.addEventListener('close', (_) => {
          resolve(true);
        });
      } else {
        // Otherwise we've already disconnected previously
        resolve(true);
      }
    });
  };

  /**
   * Connect the websocket to the realtime server. Once connected, subscription requests can be sent.
   * Call disconnect() to disconnect active connection and subscriptions.
   * @returns
   */
  public connect = async (): Promise<WebSocket> => {
    return new Promise((resolve) => {
      if (this.wsLazySingleton?.readyState === 1) {
        resolve(this.wsLazySingleton);
      }
      if (!this.wsLazySingleton) {
        this._initDefinedFiWebSocket();
      }
      if (this.wsLazySingleton?.readyState !== 1) {
        this.wsLazySingleton?.addEventListener('open', (_) => {
          resolve(this.wsLazySingleton!);
        });
      } else {
        resolve(this.wsLazySingleton);
      }
    });
  };

  /**
   * Subscribe to an arbitrary GQL query
   * @param gql Valid GQL Subscription. Examples can be found here - https://docs.defined.fi/websockets
   * @param sink Subscription event sink for consumer
   * @returns Unsubscribe function. Call to unsubscribe from the original subscription.
   */
  public subscribe = async <T>(
    gql: string,
    sink: Sink<T>
  ): Promise<() => void> => {
    // Is Websocket Ready? If not queue
    await this.connect();
    // Anything below this implies WS is connnected and ready to subscribe
    const subscriptionId = uuidv4();
    const serializedSubscription = JSON.stringify({
      query: gql,
      variables: null,
    });

    const subscriptionRequestRequest: WebSocketSubscriptionRequest = {
      id: subscriptionId,
      payload: {
        data: serializedSubscription,
        extensions: {
          authorization: {
            host: this.hostUrl,
            Authorization: this.apiKey,
          },
        },
      },
      type: 'start',
    };

    const handleMessage = (msg: any) => {
      try {
        const json = JSON.parse(
          msg.data
        ) as DefinedWebSocketSubscriptionResponse<any>;
        // Guard: Not the right shape of message, something went wrong and we don't know how to handle it.
        // Every good message should have at least an 'id'.
        if (!json.id) {
          console.warn('Unrecognized websocket message', json.payload.errors);
          return;
        }
        // Doesn't belong to our subscription, return.
        if (json.id !== subscriptionId) {
          return;
        }
        // Handle error
        if (json.type === 'error') {
          console.log(
            `Error with subscription ${subscriptionId}`,
            json.payload.errors
          );
          sink.error?.(json);
          return;
        }
        // Handle initial subscription ack
        if (json.type === 'start_ack') {
          // noop
          return;
        }
        // Otherwise, it's data...pass it to the sink
        sink.next(json.payload.data);
        return;
      } catch (e) {
        throw e;
      }
    };
    this.wsLazySingleton?.addEventListener('message', handleMessage);

    // Send subscription request
    this.wsLazySingleton!.send(JSON.stringify(subscriptionRequestRequest));

    // Unsubscribe fn
    const unsubscribe = () => {
      this.wsLazySingleton?.removeEventListener('message', handleMessage);
    };
    return unsubscribe;
  };

  /**
   * Subscribes to NFT swap events
   * https://docs.defined.fi/websockets/nfts/onCreateNftEvents
   * @param subscriptionOptions Filtering options for NFTs
   * @param sink Event sink
   * @returns Unsubscribe function
   */
  public subscribeToNftSales = (
    subscriptionOptions: SubscribeToNftSalesParams,
    sink: Sink<DefinedWebSocketOnCreatedNftEventsSubscriptionData>
  ) => {
    const gql = getDefinedNftSaleSubscriptionGql(
      subscriptionOptions.contractAddress,
      subscriptionOptions.chainId
    );
    return this.subscribe<DefinedWebSocketOnCreatedNftEventsSubscriptionData>(
      gql,
      sink
    );
  };

  /**
   * Subscribes to Token price update events
   * https://docs.defined.fi/websockets/tokens/onUpdatePrice
   * @param subscriptionOptions Filtering options for token
   * @param sink Event sink
   * @returns Unsubscribe function
   */
  public subscribeToTokenPriceUpdates = (
    subscriptionOptions: SubscribeToTokenPriceParams,
    sink: Sink<DefinedWebSocketTokenPricingData>
  ) => {
    const gql = getDefinedErc20TokenPriceUpdateGql(
      subscriptionOptions.contractAddress,
      subscriptionOptions.chainId
    );
    return this.subscribe<DefinedWebSocketTokenPricingData>(gql, sink);
  };

  /**
   * Subscribes to Token chart update events
   * https://docs.defined.fi/websockets/tokens/onUpdateAggregateBatch
   * @param subscriptionOptions Filtering options for token
   * @param sink Event sink
   * @returns Unsubscribe function
   */
  public subscribeToTokenChartUpdates = (
    subscriptionOptions: SubscribeToTokenChartParams,
    sink: Sink<DefinedWebSocketTokenChartData>
  ) => {
    const gql = getDefinedErc20TokenChartUpdateGql(
      subscriptionOptions.contractAddressOrPaidAddress,
      subscriptionOptions.chainId
    );
    return this.subscribe<DefinedWebSocketTokenChartData>(gql, sink);
  };

  /**
   * Subscribes to Token swap update events
   * https://docs.defined.fi/websockets/tokens/onCreateEvents
   * @param subscriptionOptions Filtering options for token
   * @param sink Event sink
   * @returns Unsubscribe function
   */
  public subscribeToTokenSwapUpdates = (
    subscriptionOptions: SubscribeToTokenSwapParams,
    sink: Sink<DefinedWebSocketTokenSwapData>
  ) => {
    const gql = getDefinedErc20TokenSwapUpdateGql(
      subscriptionOptions.contractAddressOrPaidAddress,
      subscriptionOptions.chainId
    );
    return this.subscribe<DefinedWebSocketTokenSwapData>(gql, sink);
  };

  public getWebSocketAuthenticatedConnectionString = () => {
    const encodedApiKeyHeader = encodeApiKeyToWebsocketAuthHeader(
      this.apiKey,
      this.hostUrl
    );
    return getDefinedWsWebsocketUrl(encodedApiKeyHeader);
  };

  private _initDefinedFiWebSocket = (): IWebSocket => {
    // If not already set up, let's bootstrap the websocket
    if (this.wsLazySingleton) {
      return this.wsLazySingleton;
    }
    // Do bootstrap...
    const websocketApiConnectionString =
      this.getWebSocketAuthenticatedConnectionString();
    this.wsLazySingleton = new this.wsFactory(
      websocketApiConnectionString,
      WS_TRANSPORT_PROTOCOL
    );
    return this.wsLazySingleton;
  };
}

export { DefinedRealtimeClient };
