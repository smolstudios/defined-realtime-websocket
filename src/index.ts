import { v4 as uuidv4 } from 'uuid';
// import invariant from 'tiny-invariant';
import invariant from '../node_modules/tiny-invariant/dist/tiny-invariant'; // wtf? todo
import {
  encodeApiKeyToWebsocketAuthHeader,
  getDefinedWsWebsocketUrl,
  getIsomorphicWebSocket,
} from './util';
import {
  DefinedWebSocketOnCreatedNftEventsSubscriptionData,
  getDefinedNftSaleSubscriptionGql,
} from './gql';
import type {
  DefinedWebSocketSubscriptionResponse,
  Sink,
  SubscribeToNftSalesParams,
  WebSocketCreator,
  WebSocketSubscriptionRequest,
} from './types';
import { WS_TRANSPORT_PROTOCOL } from './constants';

// TODO(johnrjj) - Minimum Viable Interace
type IWebSocket = WebSocket;

// Should this be a class or fn
class DefinedFiWebSocket {
  private wsCtor: WebSocketCreator;
  public wsLazySingleton: IWebSocket | undefined; // TODO(johnrjj) - Lazy load

  constructor(private apiKey: string, lazyLoad: boolean = true) {
    invariant(this.apiKey, 'DEFINED_API_KEY cannot be null');
    this.wsCtor = getIsomorphicWebSocket();
    if (lazyLoad === false) {
      this._initDefinedFiWebSocket();
    }
  }

  getWebSocketUrl = () => {
    const apiKey = this.apiKey;
    const headerQueryParm = encodeApiKeyToWebsocketAuthHeader(apiKey);
    const wsUrl = getDefinedWsWebsocketUrl(headerQueryParm);
    return wsUrl;
  };

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
   * This has a lot of states we'll need to manage, come back later, this is good for now
   * I don't like how many returns this has
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

  public subscribe = async <T>(gql: string, sink: Sink<T>) => {
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
            host: 'realtime.api.defined.fi',
            Authorization: this.apiKey,
          },
        },
      },
      type: 'start',
    };

    const handleMessage = (msg: any) => {
      try {
        console.log(msg);
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
          console.log('err', json.payload.errors);
          sink.error(json);
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

  public subscribeToTokenPriceUpdates = (
    eventSink: Sink /*<TokenData> guard type here more*/
  ) => {
    // const subId = this.subscribe(DEFINED_NFT_SALE_SUBSCRIPTION_GQL, eventSink);
  };

  private _initDefinedFiWebSocket = (): IWebSocket => {
    // If not already set up, let's bootstrap the websocket
    if (this.wsLazySingleton) {
      return this.wsLazySingleton;
    }
    // Do bootstrap...
    const encodedApiKeyHeader = encodeApiKeyToWebsocketAuthHeader(this.apiKey);
    const websocketApiConnectionString =
      getDefinedWsWebsocketUrl(encodedApiKeyHeader);
    this.wsLazySingleton = new this.wsCtor(
      websocketApiConnectionString,
      WS_TRANSPORT_PROTOCOL
    );
    return this.wsLazySingleton;
  };
}

export { DefinedFiWebSocket };
