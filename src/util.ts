import invariant from '../node_modules/tiny-invariant/dist/tiny-invariant';
import { getWebSocketBrowser } from './browser';
import { DEFAULT_WEBSOCKET_URI_ROOT } from './constants';
import { WebSocketCreator } from './types';

const btoaIsomorphic = (str: string) => {
  try {
    return btoa(str);
  } catch (err) {
    return Buffer.from(str).toString('base64');
  }
};

const getIsomorphicWebSocket = (customWebSocketImpl?: WebSocketCreator): WebSocketCreator => {
  if (customWebSocketImpl) {
    return customWebSocketImpl;
  }
  const maybeWebSocketBrowser = getWebSocketBrowser();
  if (maybeWebSocketBrowser) {
    return maybeWebSocketBrowser
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

const getDefinedWsWebsocketUrl = (headerAuthQueryParam: string) => {
  // TODO(johnrjj) - Customize urls
  return `${DEFAULT_WEBSOCKET_URI_ROOT}?header=${headerAuthQueryParam}&payload=e30=`;
};

/**
 * Encodes API key into a base64-compatible header for websocket authentication
 * @param definedApiKey API key provided by defined.fi
 * @returns
 */
const encodeApiKeyToWebsocketAuthHeader = (definedApiKey: string) => {
  const payloadToEncode = `{"host": "realtime.api.defined.fi", "Authorization": "${definedApiKey}" }`;
  return btoaIsomorphic(payloadToEncode);
};

const sleep = (timeMs: number) => {
  return new Promise((accept, reject) => {
    setTimeout(() => {
      accept(null)
    }, timeMs)
  })
}

export {
  btoaIsomorphic,
  getIsomorphicWebSocket,
  getDefinedWsWebsocketUrl,
  encodeApiKeyToWebsocketAuthHeader,
  sleep,
};
