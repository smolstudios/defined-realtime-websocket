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

export interface DefinedWebSocketPricingData {
  onUpdatePrice: OnUpdatePrice;
}

