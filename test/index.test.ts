import {
  DefinedRealtimeClient,
  DefinedWebSocketOnCreatedNftEventsSubscriptionData,
  getDefinedErc20TokenPriceUpdateGql,
  Sink,
  encodeApiKeyToWebsocketAuthHeader,
  sleep,
} from '../src/index';

// Do not use this key in production, it is a test key and will probably be banned soon.
const TEST_API_KEY = 'cy7pgfKgsMa8VZKEuDXSt5fvYtEIgxoc8XSz2jbx';
const EXPECTED_HEADER = `eyJob3N0IjogInJlYWx0aW1lLmFwaS5kZWZpbmVkLmZpIiwgIkF1dGhvcml6YXRpb24iOiAiY3k3cGdmS2dzTWE4VlpLRXVEWFN0NWZ2WXRFSWd4b2M4WFN6MmpieCIgfQ==`;

describe('definedfi-ws', () => {
  it('should base64 encode api key properly', () => {
    const generatedHeader = encodeApiKeyToWebsocketAuthHeader(TEST_API_KEY);
    expect(generatedHeader).toBe(EXPECTED_HEADER);
  });

  it('should generate correct authenticated websocket url', async () => {
    const definedWs = new DefinedRealtimeClient(TEST_API_KEY);
    const websocketUrl = definedWs.getWebSocketUrl();
    expect(websocketUrl).toBe(
      `wss://realtime.api.defined.fi/graphql/realtime?header=${EXPECTED_HEADER}&payload=e30=`
    );
  });

  it('should connect and disconnect to the websocket endpoint without error', async () => {
    const definedWs = new DefinedRealtimeClient(TEST_API_KEY);
    await definedWs.connect();
    expect(definedWs.wsLazySingleton?.readyState).toBe(1); // OPEN
    await definedWs.disconnect();
    expect(definedWs.wsLazySingleton?.readyState).toBe(
      definedWs.wsLazySingleton?.CLOSED
    );
  });

  it('should connect and subscribe to token price updates successfully', async () => {
    const definedWs = new DefinedRealtimeClient(TEST_API_KEY);

    let events: any[] = [];
    const eventSinkStub: Sink<{ foo: 'bar' }> = {
      next(value) {
        events.push(value);
      },
      error(error) {
        // noop
      },
      complete: () => {
        // noop
      },
    } as const;
    await definedWs.subscribe(
      getDefinedErc20TokenPriceUpdateGql(null, null),
      eventSinkStub
    );
    await sleep(2000);
    await definedWs.disconnect();

    expect(events.length).toBeGreaterThan(0);
  });

  it('should connect and subscribe to token price updates successfully', async () => {
    const definedWs = new DefinedRealtimeClient(TEST_API_KEY);

    let events: DefinedWebSocketOnCreatedNftEventsSubscriptionData[] = [];
    // await definedWs.subscribeToNftSales('0x5af0d9827e0c53e4799bb226655a1de152a425a5', 1, {
    await definedWs.subscribeToNftSales(
      {},
      {
        next(value) {
          events.push(value);
        },
        error(_) {
          // noop
        },
        complete: () => {
          // noop
        },
      }
    );
    await sleep(2000);
    await definedWs.disconnect();

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].onCreateNftEvents.address).toBeTruthy();
  });
});
