# ![alt tag](https://uploads-ssl.webflow.com/5fc917a7914bf7aa30cae033/5ff4e84c73f45881c8b9cd85_Logo-purple-dark-background-p-500.png)

![Python](https://img.shields.io/badge/python-v2.7+-blue.svg)
![Build Status](https://github.com/bepronetwork/bepro-js/actions/workflows/build.yml/badge.svg)
![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg)
[![GitHub issues](https://img.shields.io/github/issues/bepronetwork/bepro-js.svg)](https://GitHub.com/bepronetwork/bepro-js/issues/)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Introductions

Build the future of DeFi Gaming

## Installation

bepro-js is available as [npm package](https://www.npmjs.com/package/bepro-js).

```bash
# with npm
npm i bepro-js

# with yarn
yarn add bepro-js
```

## Local Development

### Requirements

<details>
  <summary>Python 2</summary>

  For Linux:
  ```bash
  # Install it via bash terminal globally
  sudo apt install python2

  # Check the installed version.
  # Must shown Python 2.7.18rc1 on terminal to the install be OK
  python2 --version

  # Verify Python 2.7 path
  ls /usr/bin/python*

  # Set Python 2 as alternative 1
  sudo update-alternatives --install /usr/bin/python python /usr/bin/python2 1

  # Confirm Python 2 as alternative priority 1
  sudo update-alternatives --config python

  # On the working directory, run the cmd below to set Python locally
  npm config set python python

  # Confirm the procedure.
  # Must show valid Python version on terminal if OK
  python --version
  ```

  For other systems please follow the appropriate steps.
</details>

<details>
  <summary>Node.js 14</summary>

  Install via NVM:
  ```bash
  # Install NVM
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

  # Install recommended Node.js version for bepro-js
  nvm install lts/fermium

  # Set it on the working directory
  nvm alias default lts/fermium

  # Use the settled as default
  nvm use default

  # Confirm the procedure.
  # Must show valid Node-js version on terminal if OK
  node --version
  ```
</details>

<details>
  <summary>Yarn 1</summary>

  ```bash
  npm install -g yarn
  ```

  Or check [alternative install methods](https://classic.yarnpkg.com/en/docs/install).
</details>

### Running commands

The following is a set of the commands you most likely will need. For details on these or to check all relevant Node.js tasks, please reference the `scripts` section of *package.json*.

```bash
# Install and update dependencies
yarn

# Start watch for rebuild on file changes
yarn start

# Build from src
yarn build
```

## Local Ethereum Client

For tests, we use [Ganache](https://trufflesuite.com/ganache/).

Once installed, you can:

```bash
# Boot it up
yarn ganache:start

# Run the tests
yarn test
```

## Docker support

### Requirements

<details>
  <summary>Docker 19.03.3+</summary>

  ```shell script
  sudo curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh
  ```

  **Notice**: If you already have Docker installed, this script can cause trouble. If you installed the current Docker package using this script, run it again to update Docker.

  Or use official installation instructions: [Mac](https://docs.docker.com/docker-for-mac/install/), [Windows](https://docs.docker.com/docker-for-windows/install/), [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/), [Other](https://docs.docker.com/install/#supported-platforms).
</details>

<details>
  <summary>Docker Compose 1.19.0+</summary>

  ```shell script
  sudo curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose
  ```

  For Mac or Windows take a look on: [official guides](https://docs.docker.com/compose/install/#install-compose).
</details>


### Running containers

You can use docker-compose directly, or the nifty `make` that comes bundled.

```bash
# Build images
make build

# Starting containers in background:
make up

# Start npm watch:
make watch

# Run tests
make test

# Stop containers
make down

# Using docker-compose instead of make
docker-compose up
```

## Documentation

Full API docs can be found at https://bepronetwork.github.io/bepro-js/

## Usage

### Initialization

#### Via WEB3_LINK from any Web3 Provider

Note: `WEB3_LINK` should be get from Infura/Quicknode or any other Web3 Provider - ETH, BSC, Moonbeam and others are supported

```javascript
import {
    Application, DexStorage, ERC20Contract, StakingContract,
    ERC20TokenLock, ERC721Collectibles, ERC721Standard
} from 'bepro-js';

/* 1.1 - Instantiate the App for Metamask functionality (MAINNET) */
let app = new Application({
  opt: { web3Connection: 'WEB3_LINK' },
});

/* 1.2 - Instantiate StakingContract Object or any other in a similar way (Staking, ERC20 etc..) */
// - MAINNET
let staking = new StakingContract({
  contractAddress: null, /* Contract Address (optional) */
  opt: { web3Connection: 'WEB3_LINK' },
});

// - TEST net e.g. Rinkeby
let stakingTest = new StakingContract({
  test: true,
  contractAddress: null, /* Contract Address (optional) */
});

/* 2 - Connect the App/Contract to the Metamask Web3 Injected wallet*/
await app.login();
await staking.login();
/* or instantiate with the provided web3Connection, for tests it was already done at object creation */
await app.start();
await staking.start();
```

#### Via leveraged Web3 Provider

Application can be initialized with a web3 provider directly, but all connection login is assumed to be on the consumer side in this case; i.e. no need to call start() or login(), that logic should be handled separately within the provider itself or by the consumer.

```javascript
// Use Metamask's provider, could be any other compatible Web3 Provider object from any other lib
let app = new Application({ opt: { provider: window.ethereum } });
```

### Asserting and Deploying contracts

```javascript
/* 4 - Assert all object data */
await staking.__assert();
await stakingTest.__assert();
/* or deploy the contract*/
await staking.deploy();
await stakingTest.deploy();
```

### Accessing methods

```javascript
/* 5 - Access other Methods */
await staking.availableTokens();
await stakingTest.availableTokens();
```

### Transaction options

Most contract `send` methods (those that act on and potentially alter the state of the blockchain) can be passed an optional argument, taking the form of an object with several properties that control the transaction.

#### Gas Fees

Transaction fees are automatically calculated via web3's own estimation methods.

In order to overestimate and avoid out-of-gas transaction errors if necessary, we can pass a second argument with certain parameters to most Contract methods that involve `send` transactions (those requiring gas):

```javascript
staking.subscribeProduct(
  { address, product_id, amount },
  {
    gasAmount: 201654, // override the estimated gas fee for this method
    gasFactor: 1.2, // applied to every calculated or given gas amount, including the gasAmount from this object if passed
    gasPrice: '5000000000', // override the network's default gas price
  },
);
```

In particular, `gasFactor` is a parameter that can be passed when instantiating the contract, so that gas estimations for every method called on that contract instance will have that factor applied:

```javascript
let staking = new StakingContract({
  contractAddress,
  gasFactor: 1.25 // default 1
  opt: { provider },
});

// The following will have a gasFactor of 1.25
staking.subscribeProduct({ address, product_id, amount });

// We can still override it per-method, and pass other parameters as well.
staking.subscribeProduct(
  { address, product_id, amount },
  {
    gasAmount: 201654,
    gasFactor: 1.2,
  },
);
```

Estimated gas fees leverage the following web3 functionalities:
- [chain's getGasPrice()](https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html#getgasprice)
- [contract method's estimateGas()](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html?highlight=estimateGas#methods-mymethod-estimategas)

#### Transaction signer

You can get all accounts (wallet addressed) managed by the current wallet provider through:

```javascript
await app.getAccounts();
// => [ '0xAbA...', '0xCdD...', '0xEfE...', ... ]
```

By default all transactions will be signed by the first account, which is considered currently active. Any transaction on any contract, including deployment, can be signed by any of the connected accounts:

```javascript
await staking.deploy({ from: '0xCdC...' });

await staking.subscribeProduct(
  { address, product_id, amount },
  { from: '0xCdC...' },
);
```

## Contribution

Contributions are welcomed but we ask to read existing code guidelines, especially for the code format. Please review [Contributor guidelines][1]

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Notes

The usage of `ETH` in all methods or params means using the native currency of that blockchain, example `BSC` in Binance Chain would still be nominated as `ETH`

[1]: https://github.com/bepronetwork/bepro-js/blob/master/CONTRIBUTING.md
