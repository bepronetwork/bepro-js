# ![alt tag](https://uploads-ssl.webflow.com/5fc917a7914bf7aa30cae033/5ff4e84c73f45881c8b9cd85_Logo-purple-dark-background-p-500.png)

![Build Status](https://github.com/bepronetwork/bepro-js/actions/workflows/build.yml/badge.svg)
![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg)
[![GitHub issues](https://img.shields.io/github/issues/bepronetwork/bepro-js.svg)](https://GitHub.com/bepronetwork/bepro-js/issues/)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Installation

`npm install --save github:bepronetwork/bepro-js#2.0.0-alpha.0`

## Usage

```ts
import {Web3Connection, Web3ConnectionOptions, ERC20} from 'bepro-js';

const options: Web3ConnectionOptions = { web3Host: process.env.WEB3_HOST_PROVIDER };
const web3Connection = new Web3Connection(options);

await web3Connection.start(); // start web3 connection so assignments are made
await web3Connection.connect(); // connect web3 by asking the user to allow the connection (this is needed for the user to _interact_ with the chain)

const erc20Deployer = new ERC20(web3Connection);
await erc20Deployer.loadAbi(); // load abi contract is only needed for deploy actions

const tx =
  await erc20Deployer.deployJsonAbi(
    'Token Name', // the name of the token
    '$tokenSymbol', // the symbol of the token
    1000000000000000000000000, // the total amount of the token (with 18 decimals; 1M = 1000000000000000000000000)
    await erc20Deployer.connection.getAddress() // the owner of the total amount of the tokens (your address)
  );

console.log(tx); // { ... , contractAddress: string} 

const myToken = new ERC20(web3Connection, tx.contractAddress);

await myToken.start() // load contract and connection into the class representing your token

await myToken.transferTokenAmount('0xYourOtherAddress', 1); // transfer 1 token from your address to other address

```

Please refer to the [`test/`](./test/models) folder to read further usage examples of the various contracts available.

## Generating documentation
You can generate the documentation locally by issuing 
```
$ npm run docs
```
and then serving the `docs/` folder as a root http-server.

Alternatively you can read the generated  [documentation here](https://moshmage.github.io/bepro-js/)

## Contribution

Contributions are welcomed, but we ask that you read existing code guidelines, specially the code format. 
Please review [Contributor guidelines](https://github.com/bepronetwork/bepro-js/blob/master/CONTRIBUTING.md)

## License

[ISC](./LICENSE.txt)

### Notes
- [Docker support](./docker-readme.md)
- [CoC](./CODE_OF_CONDUCT.md)
