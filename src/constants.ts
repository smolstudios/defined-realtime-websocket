export const DEFAULT_HOST_URI = `realtime.api.defined.fi`
export const DEFAULT_WEBSOCKET_URI_ROOT = `wss://realtime.api.defined.fi/graphql/realtime`
export const WS_TRANSPORT_PROTOCOL = 'graphql-ws';


// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
/**
 * 
0	CONNECTING	Socket has been created. The connection is not yet open.
1	OPEN	The connection is open and ready to communicate.
2	CLOSING	The connection is in the process of closing.
3	CLOSED	The connection is closed or couldn't be opened.
 * 
 */