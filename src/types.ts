interface Authorization {
    host: string;
    Authorization: string;
  }
  
   interface Extensions {
    authorization: Authorization;
  }
  
   interface Payload {
    data: string;
    extensions: Extensions;
  }
  
  export interface WebSocketSubscriptionPayload {
    id: string;
    payload: Payload;
    type: string;
  }
  





  export interface WebSocketCreator {
    new (url: string | URL, protocols?: string | string[] | undefined): WebSocket;
    prototype: WebSocket;
    readonly CLOSED: number;
    readonly CLOSING: number;
    readonly CONNECTING: number;
    readonly OPEN: number;
  }