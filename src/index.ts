import { v4 as uuidv4 } from 'uuid';
// import invariant from 'tiny-invariant';
import invariant from '../node_modules/tiny-invariant/dist/tiny-invariant'; // wtf? todo
import {
  encodeApiKeyToWebsocketAuthHeader,
  getDefinedWsWebsocketUrl,
  getIsomorphicWebSocket,
} from './util';
import { DEFINED_NFT_SALE_SUBSCRIPTION_GQL } from './gql';
import type { WebSocketCreator, WebSocketSubscriptionPayload } from './types';
import { WS_TRANSPORT_PROTOCOL } from './constants';

// TODO(johnrjj) - Minimum Viable Interace
type IWebSocket = WebSocket;

// Should this be a class or fn
class DefinedFiWebSocket {
  private wsCtor: WebSocketCreator;
  public wsLazySingleton: IWebSocket | undefined; // TODO(johnrjj) - Lazy load
  private isReady: boolean = false;
  private isReadyPromise: Promise<boolean> | undefined;

  constructor(private apiKey: string, lazyLoad: boolean = false) {
    this.wsCtor = getIsomorphicWebSocket();

    if (lazyLoad === false) {
      this.initDefinedFiWebSocket();
    }
  }

  getWebSocketUrl = () => {
    const apiKey = this.apiKey;
    const headerQueryParm = DefinedFiWebSocket.encodeApiKeyForHeader(apiKey);
    const wsUrl = getDefinedWsWebsocketUrl(headerQueryParm);
    return wsUrl;
  };

  handleWebSocketOpen = () => {
    // console.log('websocket connected...');
  };

  handleWebSocketError = (err: Event) => {
    // console.log('ws:err', err);
  };

  handleWebSocketClose = (closeEvent: CloseEvent) => {
    // console.log('ws:close', closeEvent);
  };

  handleWebSocketMessage = () => {
    // todo
  };

  waitForOpenSocket = () => {
    // Much better! LOL
  };

  public close = async (): Promise<boolean> => {
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
   * @returns
   */
  public connect = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (this.isReady) {
        return true;
      }
      if (!this.wsLazySingleton) {
        this.initDefinedFiWebSocket();
      }
      if (this.wsLazySingleton?.readyState !== 1) {
        this.wsLazySingleton?.addEventListener('open', (_) => {
          resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  };

  private initDefinedFiWebSocket = (): IWebSocket => {
    // If not already set up, let's bootstrap the websocket
    if (!this.wsLazySingleton) {
      // Do bootstrap...
      const encodedApiKeyHeader = encodeApiKeyToWebsocketAuthHeader(
        this.apiKey
      );
      const websocketApiConnectionString =
        getDefinedWsWebsocketUrl(encodedApiKeyHeader);
      this.wsLazySingleton = new this.wsCtor(
        websocketApiConnectionString,
        WS_TRANSPORT_PROTOCOL
      );
      this.wsLazySingleton.addEventListener(
        'open',
        () => this.handleWebSocketOpen
      );
      this.wsLazySingleton.addEventListener('error', (err) =>
        this.handleWebSocketError(err)
      );
      this.wsLazySingleton.addEventListener('close', (closeEvent) =>
        this.handleWebSocketClose(closeEvent)
      );
      // Let's strongly type this one...saving for later..
      // this.wsLazySingleton.addEventListener('message', (msg) => this.handleWebSocketMessage(err))
      return this.wsLazySingleton;
    }
    // Already has been created, just return singleton
    return this.wsLazySingleton;
  };

  subscribe = <T>(gql: string) => {
    // Is Websocket Ready? If not queue

    invariant(this.apiKey, 'DEFINED_API_KEY cannot be null');
    const subscriptionId = uuidv4();

    const subscriptionRequestPayload: WebSocketSubscriptionPayload = {
      id: subscriptionId,
      payload: {
        data: 'stringified_gql_goes_here',
        extensions: {
          authorization: {
            host: 'realtime.api.defined.fi',
            Authorization: this.apiKey,
          },
        },
      },
      type: 'start',
    };

    // const ws = this.getWs();
    // ws.send(JSON.stringify(subscriptionRequestPayload));
    // Now we need to manage subscriptions manually since websockets sucks
  };

  private generateSubscriptionId = (uid = uuidv4()) => {
    return uid;
  };

  subscribeToNftSales = (contractAddress: string, chainId: number | string) => {
    const subscriptionId = this.generateSubscriptionId();
    // TODO(johnrjj) - Fancy typings...
    // this.subscribe<T>(DEFINED_NFT_SALE_SUBSCRIPTION_GQL)
  };

  subscribeToTokenPriceUpdates = () => {
    const subscriptionId = this.generateSubscriptionId();
    this.subscribe(DEFINED_NFT_SALE_SUBSCRIPTION_GQL);
  };

  static encodeApiKeyForHeader = (apiKey: string): string => {
    return encodeApiKeyToWebsocketAuthHeader(apiKey);
  };
}

export { DefinedFiWebSocket };
