# dappkit - SDK for Web3.0

dappkit is a curated framework so that you can automate creation and unit testing, javascript wrappers, and extended integration just by writing solidity - a tool built with [Truffle](https://trufflesuite.com/docs/truffle/) (integrates compiling in solc together in your Smart Contracts) & [Open Zeppelin](https://openzeppelin.com/) (provides trustable, audited & tested Smart Contracts) already integrated, solving a very simple problem: velocity in solidity development.

![Build Status](https://github.com/taikai/dappkit/actions/workflows/build.yml/badge.svg)
![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg)
[![GitHub issues](https://img.shields.io/github/issues/taikai/dappkit.svg)](https://GitHub.com/taikai/dappkit/issues/)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](https://opensource.org/licenses/ISC)


## Installation

```npm install @taikai/dappkit@2.0.0-alpha.2```

## Usage

```ts
import {Web3Connection, Web3ConnectionOptions, ERC20} from '@taikai/dappkit';

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

## Documentation 

* [Guides](https://docs.bepro.network/sdk-documentation/start-building/how-to-guides)
* [SDK Documentation](https://taikai.github.io/dappkit/)
* [Use Cases](https://docs.bepro.network/sdk-documentation/use-cases)

### How to Generate Documentation 

You can generate the documentation locally by issuing 
```
$ npm run docs
```
and then serving the `docs/` folder as a root http-server.

## Contribution

Contributions are welcomed, but we ask that you read existing code guidelines, specially the code format. 
Please review [Contributor guidelines](https://github.com/taikai/dappkit/blob/master/CONTRIBUTING.md)

## License

[ISC](./LICENSE.txt)

### Notes
- [Docker support](./docker-readme.md)
- [CoC](./CODE_OF_CONDUCT.md)
