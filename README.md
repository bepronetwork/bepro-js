# bepro-js

bepro-js is package to integrate BEPRO On-Chain products

## Installation

Use the package manager [npm] to install npm.

```bash
npm i bepro-js
```

## Usage

```javascript
import moment from 'moment';
import Application from 'bepro-js';

/* Test Version */
let app = new Application({test : true});

/* Generate a Staking Platform */
let stking = app.getStakingContract({contractAddress : /* Contract Address (optional) */});

/* Assert all data */
await staking.__assert();
/* or */

/* Deploy The Contract */
await staking.deploy();

## License

[MIT](https://choosealicense.com/licenses/mit/)