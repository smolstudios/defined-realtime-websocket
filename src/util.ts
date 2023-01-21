import { invariant } from './invariant';
import { getWebSocketBrowser } from './browser';
import { DEFAULT_HOST_URI, DEFAULT_WEBSOCKET_URI_ROOT } from './constants';
import { WebSocketFactory } from './types';

const btoaIsomorphic = (str: string) => {
  try {
    return btoa(str);
  } catch (err) {
    return Buffer.from(str).toString('base64');
  }
};

const getIsomorphicWebSocket = (
  customWebSocketImpl?: WebSocketFactory
): WebSocketFactory => {
  if (customWebSocketImpl) {
    return customWebSocketImpl;
  }
  const maybeWebSocketBrowser = getWebSocketBrowser();
  if (maybeWebSocketBrowser) {
    return maybeWebSocketBrowser;
  }
  // Non-browser env
  if (typeof window === 'undefined') {
    const ws = require('ws');
    return ws;
  }
  // Browser env
  invariant(maybeWebSocketBrowser, 'No applicable WebSocket found');

  return maybeWebSocketBrowser;
};

const getDefinedWsWebsocketUrl = (
  base64EncodedHeaderAuthQueryParam: string,
  websocketUrlRoot: string = DEFAULT_WEBSOCKET_URI_ROOT
) => {
  // TODO(johnrjj) - Customize urls
  return `${websocketUrlRoot}?header=${base64EncodedHeaderAuthQueryParam}&payload=e30=`;
};

/**
 * Encodes API key into a base64-compatible header for websocket authentication
 * @param definedApiKey API key provided by defined.fi
 * @returns
 */
const encodeApiKeyToWebsocketAuthHeader = (
  definedApiKey: string,
  hostRootUri: string = DEFAULT_HOST_URI
) => {
  const payloadToEncode = `{"host": "${hostRootUri}", "Authorization": "${definedApiKey}" }`;
  return btoaIsomorphic(payloadToEncode);
};

const sleep = (timeMs: number) => {
  return new Promise((accept, _reject) => {
    setTimeout(() => {
      accept(null);
    }, timeMs);
  });
};

export {
  btoaIsomorphic,
  getIsomorphicWebSocket,
  getDefinedWsWebsocketUrl,
  encodeApiKeyToWebsocketAuthHeader,
  sleep,
};
