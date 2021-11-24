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
// with npm
$ npm i bepro-js
```

Before try to install, make sure your working directory has `Python 2` and the recommended `NVM` version setted on. To do, so:

1. Setting of Python 2:

```bash
// Install it via bash terminal globally
$ sudo apt install python2

// Check the installed version.
// Must shown Python 2.7.18rc1 on terminal to the install be OK
$ python2 --version

// Verify Python 2.7 path
$ ls /usr/bin/python*

// Set Python 2 as alternative 1
$ sudo update-alternatives --install /usr/bin/python python /usr/bin/python2 1

// Confirm Python 2 as alternative priority 1
$ sudo update-alternatives --config python

// Confirm the procedure.
// Must shown Python 2.7.18rc1 on terminal to the install be OK
$ python --version

// On the working directory, run the cmd below to set Python locally
$ npm config set python python
```

2. Setting of Node:

```bash
// Install NVM recommended version for bepro-js
$ nvm install 14.17.0

// Set it on the working directory
$ nvm alias default v14.17.0

// Use the settled as default
$ nvm use default
```

Now, your work directory is able to install and run bepro-js.

## Docker support

### Requirements

- Docker CE - 19.03.3+
- Docker Compose - 1.19.0+

### How to install or upgrade docker and docker-compose?

##### Docker:

```shell script
sudo curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh
```

**Notice**: If you already have Docker installed, this script can cause trouble. If you installed the current Docker package using this script and are using it again to update Docker. Or use official installation instructions: [Mac](https://docs.docker.com/docker-for-mac/install/), [Windows](https://docs.docker.com/docker-for-windows/install/), [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/), [Other](https://docs.docker.com/install/#supported-platforms).

##### Docker Compose:

For linux:

```shell script
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose
```

For Mac or Windows take a look on: [official guides](https://docs.docker.com/compose/install/#install-compose).

### Running containers

You can use docker-compose directly, or the nifty `make` that comes bundled.

#### Build images

```shell script
make build
```

#### Starting containers in background:

```shell script
make up
```

#### Start npm watch:

```shell script
make watch
```

#### Run tests

```shell script
make test
```

#### Stop containers

```shell script
make down
```

#### Using docker-compose instead of make

```shell script
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

### Gas Fees

Transaction fees are automatically calculated via web3's own estimations. We can initialize a contract with a `gasFactor` parameter that will be applied to every calculated fee, in order to overestimate and avoid out-of-gas transaction errors if necessary.

```javascript
let staking = new StakingContract({
  contractAddress,
  gasFactor: 1.25 // default 1
  opt: { provider, },
});
```

Estimated gas fees leverage the following web3 functionalities:
- [chain's getGasPrice()](https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html#getgasprice)
- [contract method's estimateGas()](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html?highlight=estimateGas#methods-mymethod-estimategas)

You can also override the next transaction's gas, by updating a contract object's params:

```javascript
staking.updateParams({
  nextGasLimit: 100000, // limit next gas fee to 100000 x gas price
  nextGasPrice: '6000000000', // 6 GWEI for next transaction
});
staking.subscribeProduct({ address, product_id, amount });

// This next transaction will once again use the web3 estimates.
staking.withdrawSubscription({ product_id, subscription_id });
```

## Contribution

Contributions are welcomed but we ask to red existing code guidelines, specially the code format. Please review [Contributor guidelines][1]

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Notes

The usage of ETH in all methods or params means using the native currency of that blockchain, example BSC in Binance Chain would still be nominated as ETH

[1]: https://github.com/bepronetwork/bepro-js/blob/master/CONTRIBUTING.md
