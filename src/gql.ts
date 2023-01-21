type FilterTuple = [string, string | number];

const generateSubClause = (tuple: FilterTuple) => {
  const [key, val] = tuple;
  const isValNumber = typeof val === 'number';
  let subfilter = `${key}: "${val}"`;
  if (isValNumber) {
    subfilter = `${key}: ${val}`;
  }
  return subfilter;
};

export const getDefinedNftSaleSubscriptionGql = (
  contractAddress: string | undefined | null,
  networkId: number | string | undefined | null
) => {
  const filterParams: Array<FilterTuple> = [];
  if (contractAddress) {
    //  Note: address must be lowercase
    filterParams.push(['address', contractAddress.toLowerCase()]);
  }
  if (networkId) {
    filterParams.push(['networkId', parseInt(networkId.toString(10), 10)]);
  }
  let whereClause = ``;
  const subclauses = filterParams.map(generateSubClause);
  if (subclauses.length > 0) {
    whereClause = `(${subclauses.join(',')})`;
  }

  return `
subscription NftSaleEventSubscription {
  onCreateNftEvents${whereClause} {
    address
    id
    networkId
    events {
      id
      tokenId
      aggregatorAddress
      blockNumber
      contractAddress
      eventType
      exchangeAddress
      data {
        buyHash
        maker
        metadata
        price
        sellHash
        taker
        type
      }
      taker
      timestamp
      numberOfTokens
      transactionHash
      logIndex
      maker
      networkId
      totalPriceNetworkBaseToken
      totalPriceUsd
      transactionIndex
      individualPrice
      individualPriceUsd
      individualPriceNetworkBaseToken
      paymentTokenAddress
      poolAddress
      sortKey
      totalPrice
    }
  }
}
`;
};

export interface NftSwapEventData {
  buyHash?: any;
  maker: string;
  metadata?: any;
  price: string;
  sellHash?: any;
  taker: string;
  type: string;
}

export interface OnCreateNftEvent {
  id: string;
  tokenId: string;
  aggregatorAddress?: any;
  blockNumber: number;
  contractAddress: string;
  eventType: string;
  exchangeAddress: string;
  data: NftSwapEventData;
  taker: string;
  timestamp: number;
  numberOfTokens: string;
  transactionHash: string;
  logIndex: number;
  maker: string;
  networkId: number;
  totalPriceNetworkBaseToken: string;
  totalPriceUsd: string;
  transactionIndex: number;
  individualPrice: string;
  individualPriceUsd: string;
  individualPriceNetworkBaseToken: string;
  paymentTokenAddress: string;
  poolAddress?: any;
  sortKey: string;
  totalPrice: string;
}

export interface OnCreateNftEvents {
  address: string;
  id: string;
  networkId: number;
  events: OnCreateNftEvent[];
}

export interface DefinedWebSocketOnCreatedNftEventsSubscriptionData {
  onCreateNftEvents: OnCreateNftEvents;
}

export const getDefinedErc20TokenPriceUpdateGql = (
  contractAddress: string | undefined | null,
  networkId: number | string | undefined | null
) => {
  const filterParams: Array<FilterTuple> = [];
  if (contractAddress) {
    //  Note: address must be lowercase
    filterParams.push(['address', contractAddress.toLowerCase()]);
  }
  if (networkId) {
    filterParams.push(['networkId', parseInt(networkId.toString(10), 10)]);
  }
  let whereClause = ``;
  const subclauses = filterParams.map(generateSubClause);
  if (subclauses.length > 0) {
    whereClause = `(${subclauses.join(',')})`;
  }

  return `
subscription UpdatePrice {
    onUpdatePrice${whereClause} {
      address
      networkId
      priceUsd
      timestamp
    }
  }
`;
};

export interface OnUpdatePrice {
  timestamp: number;
  priceUsd: number;
  networkId: number;
  address: string;
}

export interface DefinedWebSocketTokenPricingData {
  onUpdatePrice: OnUpdatePrice;
}

export const getDefinedErc20TokenSwapUpdateGql = (
  contractAddressOrPairAddress: string | undefined | null,
  networkId: number | string | undefined | null
) => {
  const filterParams: Array<FilterTuple> = [];
  if (contractAddressOrPairAddress && networkId) {
    //  Note: address must be lowercase
    filterParams.push([
      'pairId',
      contractAddressOrPairAddress.toLowerCase() + ':' + networkId,
    ]);
  }
  let whereClause = ``;
  const subclauses = filterParams.map(generateSubClause);
  if (subclauses.length > 0) {
    whereClause = `(${subclauses.join(',')})`;
  }

  return `
  subscription UpdateAggregateBatch {
    onUpdateAggregateBatch${whereClause} {
      eventSortKey
      networkId
      pairAddress
      pairId
      timestamp
      aggregates {
      r1 {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
      r5 {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
      r15 {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
      r30 {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
      r60 {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
      r240 {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
      r720 {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
      r1D {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
      r7D {
        t
        usd {
          t
          o
          h
          l
          c
          volume
        }
        token {
          t
          o
          h
          l
          c
          volume
        }
      }
    }
  }
`;
};

// https://docs.defined.fi/websockets/tokens/onUpdateAggregateBatch#individualbardata
export interface OHLCIndividualBarData {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  volume: string;
  __typename: string;
}

// https://docs.defined.fi/websockets/tokens/onUpdateAggregateBatch#currencybardata
export interface CurrencyBarData {
  t: number;
  usd: OHLCIndividualBarData;
  token: OHLCIndividualBarData;
  __typename: string;
}

export interface ChartUpdateAggregates {
  r1: CurrencyBarData;
  r5: CurrencyBarData;
  r15: CurrencyBarData;
  r30: CurrencyBarData;
  r60: CurrencyBarData;
  r240: CurrencyBarData;
  r720: CurrencyBarData;
  r1D: CurrencyBarData;
  r7D: CurrencyBarData;
  __typename: string;
}

export interface OnUpdateAggregateBatch {
  eventSortKey: string;
  networkId: number;
  pairAddress: string;
  pairId: string;
  timestamp: number;
  aggregates: ChartUpdateAggregates;
  __typename: string;
}

export interface DefinedWebSocketTokenChartData {
  onUpdateAggregateBatch: OnUpdateAggregateBatch;
}

export const getDefinedErc20TokenChartUpdateGql = (
  contractAddressOrPairAddress: string | undefined | null,
  networkId: number | string | undefined | null
) => {
  const filterParams: Array<FilterTuple> = [];
  if (contractAddressOrPairAddress && networkId) {
    //  Note: address must be lowercase
    filterParams.push([
      'pairId',
      contractAddressOrPairAddress.toLowerCase() + ':' + networkId,
    ]);
  }
  let whereClause = ``;
  const subclauses = filterParams.map(generateSubClause);
  if (subclauses.length > 0) {
    whereClause = `(${subclauses.join(',')})`;
  }

  return `
  subscription CreateEvents {
    onCreateEvents(id: $id) {
      events {
        address
        baseTokenPrice
        blockHash
        blockNumber
        eventDisplayType
        eventType
        logIndex
        id
        liquidityToken
        maker
        networkId
        timestamp
        token0SwapValueUsd
        token0ValueBase
        token1SwapValueUsd
        token1ValueBase
        transactionHash
        transactionIndex
        data {
          ... on MintEventData {
            amount0
            amount1
            amount0Shifted
            amount1Shifted
            tickLower
            tickUpper
            type
          }
          ... on BurnEventData {
            amount0
            amount1
            amount0Shifted
            amount1Shifted
            tickLower
            tickUpper
            type
          }
          ... on SwapEventData {
            amount0
            amount0In
            amount0Out
            amount1
            amount1In
            amount1Out
            amountNonLiquidityToken
            priceBaseToken
            priceBaseTokenTotal
            priceUsd
            priceUsdTotal
            tick
            type
          }
        }
      }
      address
      id
      networkId
    }
  }
`;
};

export interface TokenSwapEventData {
  amount0?: any;
  amount0In: string;
  amount0Out: string;
  amount1?: any;
  amount1In: string;
  amount1Out: string;
  amountNonLiquidityToken: string;
  priceBaseToken: string;
  priceBaseTokenTotal: string;
  priceUsd: string;
  priceUsdTotal: string;
  tick?: any;
  type: string;
}

export interface TokenSwapEvent {
  address: string;
  baseTokenPrice: string;
  blockHash: string;
  blockNumber: number;
  eventDisplayType: string;
  eventType: string;
  logIndex: number;
  id: string;
  liquidityToken: string;
  maker: string;
  networkId: number;
  timestamp: number;
  token0SwapValueUsd: string;
  token0ValueBase: string;
  token1SwapValueUsd: string;
  token1ValueBase: string;
  transactionHash: string;
  transactionIndex: number;
  data: TokenSwapEventData;
}

export interface OnCreateEvents {
  events: TokenSwapEvent[];
}

export interface DefinedWebSocketTokenSwapData {
  onCreateEvents: OnCreateEvents;
}
