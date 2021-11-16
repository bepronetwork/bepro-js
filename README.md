# ![alt tag](https://uploads-ssl.webflow.com/5fc917a7914bf7aa30cae033/5ff4e84c73f45881c8b9cd85_Logo-purple-dark-background-p-500.png)

## Introductions

`bepro-js#feature/prediction-markets` is the BEPRO Javascript SDK to integrate Prediction Markets into any dapp.

## Installation

Using [npm](https://www.npmjs.com/):

```bash
npm install "https://github.com/bepronetwork/bepro-js.git#feature/prediction-markets" --save
```

Using [yarn](https://yarnpkg.com/):

```bash
yarn add https://github.com/bepronetwork/bepro-js.git#feature/prediction-markets
```

## Usage

### Initializing App

`bepro-js` library initialization is performed in [`Application.js`](https://github.com/bepronetwork/bepro-js/blob/feature/prediction-markets/src/Application.js).

You'll need to provide a web3 RPC provider (e.g., Infura for Ethereum dapps)

```javascript
import * as beprojs from 'bepro-js';

// Moonriver RPC
const web3Provider = 'https://rpc.moonriver.moonbeam.network';

const bepro = new beprojs.Application({ web3Provider });

// Starting application
bepro.start();

// Connecting wallet
await bepro.login();
```

### Prediction Markets

Once the library is initialized, it's ready to interact with prediction markets smart contracts.

```javascript
const contractAddress = '0xDcBe79f74c98368141798eA0b7b979B9bA54b026';
const contract = bepro.getPredictionMarketContract({ contractAddress });
```

Once initialized, you'll be able to interact with the smart contract.

- Prediction Market Smart Contract: [PredictionMarket.sol](https://github.com/bepronetwork/bepro-js/blob/feature/prediction-markets/contracts/PredictionMarket.sol)
- Prediction Market JS Integration: [PredictionMarketContract.js](https://github.com/bepronetwork/bepro-js/blob/feature/prediction-markets/src/models/PredictionMarketContract.js)

Here's a few call examples

```javascript
const marketId = 1;
const outcomeId = 2;
const ethAmount = 0.1;

// Fetching all Market Ids
await contract.getMarkets();

// Fetching Market Details
await contract.getMarketData({ marketId });

// Buying Outcome Shares
const mintOutcomeSharesToBuy = await contract.calcBuyAmount({ marketId, outcomeId, ethAmount })
await contract.buy({ marketId, outcomeId, ethAmount, minOutcomeSharesToBuy });

// Selling Outcome Shares
const maxOutcomeSharesToSell = await contract.calcSellAmount({ marketId, outcomeId, ethAmount })
await contract.buy({ marketId, outcomeId, ethAmount, maxOutcomeSharesToSell });

// Claiming Winnings
await contract.claimWinnings({ marketId });

// Fetching portfolio data
await contract.getMyPortfolio();
```

## Contribution

Contributions are welcomed but we ask to red existing code guidelines, specially the code format. Please review [Contributor guidelines][1]

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Notes

The usage of ETH in all methods or params means using the native currency of that blockchain, example BSC in Binance Chain would still be nominated as ETH

[1]: https://github.com/bepronetwork/bepro-js/blob/master/CONTRIBUTING.md
