

![alt tag](https://uploads-ssl.webflow.com/5fc917a7914bf7aa30cae033/5ff4e84c73f45881c8b9cd85_Logo-purple-dark-background-p-500.png)
=========

![Python](https://img.shields.io/badge/python-v2.7+-blue.svg)
![Build Status](https://github.com/bepronetwork/bepro-js/actions/workflows/build.yml/badge.svg
)
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
$ nvm install 8.12.0

// Set it on the working directory
$ nvm alias default v8.12.0

// Use the settled as default
$ nvm use default
```

Now, your work directory is able to install and run bepro-js.

## Usage

https://bepronetwork.github.io/bepro-js/

```javascript

/* Note :  WEB3_LINK should be get from Infura/Quicknode or any other Web3 Provider - ETH, BSC, Moonbeam and others are supported */

import moment from 'moment';
import { Application } from 'bepro-js';

/* 1 - Instantiate the App with the Infura/Web3 Connection */
let app = new Application({opt : {web3Connection : 'WEB3_LINK'}});

/* 2 - Connect the App to the Metamask Web3 Injected wallet*/
await app.login();
/* or instantiate with the provided web3Connection */
await app.start()

/* 3 - Generate a Object (Staking, ERC20 etc..) */
let staking = app.getStakingContract({contractAddress : /* Contract Address (optional) */});

/* 4 - Assert all object data */
await staking.__assert();
/* or deploy the contract*/
await staking.deploy();

/* 5 - Access other Methods */
await staking.availableTokens();

```
## Contribution
Contributions are welcomed but we ask to red existing code guidelines, specially the code format. Please review [Contributor guidelines][1]

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Notes

The usage of ETH in all methods or params means using the native currency of that blockchain, example BSC in Binance Chain would still be nominated as ETH

[1]: https://github.com/bepronetwork/bepro-js/blob/master/CONTRIBUTING.md
