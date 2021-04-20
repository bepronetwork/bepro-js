# bepro-js

bepro-js is package to integrate BEPRO On-Chain products

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

```javascript
import moment from 'moment';
import Application from 'bepro-js';

/* Test Version */
let app = new Application({test : true});

/* Generate a Staking Platform */
let staking = app.getStakingContract({contractAddress : /* Contract Address (optional) */});

/* Assert all data */
await staking.__assert();
/* or */

/* Deploy The Contract */
await staking.deploy();

```
## License

[MIT](https://choosealicense.com/licenses/mit/)

## Notes

The usage of ETH in all methods or params means using the native currency of that blockchain, example BSC in Binance Chain would still be nominated as ETH
```javascript 

isETHTrade() is also used to verify if the sale is done in BSC for Binance Chain

```