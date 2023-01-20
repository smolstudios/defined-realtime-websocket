export const DEFINED_NFT_SALE_SUBSCRIPTION_GQL = `
subscription NftSaleEventSubscription {
  onCreateNftEvents(address: "0xCa7cA7BcC765F77339bE2d648BA53ce9c8a262bD", networkId: 1) {
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

export const DEFINED_ERC20_UPDATE_PRICE_SUBSCRIPTION_GQL = () => `
subscription UpdatePrice($address: String, $networkId: Int) {
    onUpdatePrice(address: $address, networkId: $networkId) {
      address
      networkId
      priceUsd
      timestamp
    }
  }
`;

export const TEST_GQL_SUB =
  '{"query":"subscription MySubscription {\\n  onUpdatePrice {\\n    timestamp\\n    priceUsd\\n    networkId\\n    address\\n  }\\n}","variables":null}';
