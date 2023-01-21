// https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

import type { WebSocketFactory } from './types';

const getWebSocketBrowser = (): WebSocketFactory | undefined => {
  var ws = undefined;
  if (typeof WebSocket !== 'undefined') {
    ws = WebSocket;
    // @ts-ignore
  } else if (typeof MozWebSocket !== 'undefined') {
    // @ts-ignore
    ws = MozWebSocket;
  } else if (typeof global !== 'undefined') {
    ws = global.WebSocket || (global as any).MozWebSocket;
  } else if (typeof window !== 'undefined') {
    ws = window.WebSocket || (window as any).MozWebSocket;
  } else if (typeof self !== 'undefined') {
    ws = self.WebSocket || (self as any).MozWebSocket;
  }
  return ws;
};

export { getWebSocketBrowser };
