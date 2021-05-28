import { exchange } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

/**
 * @typedef {Object} ExchangeContract~Options
 * @property {number} decimals
 * @property {string} tokenAddress
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * Exchange Contract Object
 * @class ExchangeContract
 * @param {ExchangeContract~Options} options
 */
class ExchangeContract extends IContract {
  constructor(params) {
    super({ abi: exchange, ...params });
  }

  /**
   * Get Events
   * @returns {Promise<number[]>} Get Events ID
   */
  async getEvents() {
    const res = await this.params.contract
      .getContract()
      .methods.getEvents()
      .call();
    return res.map(id => Numbers.fromHex(id));
  }

  /**
   * Get Events
   * @returns {Promise<number[]>} Get Events ID
   */
  async getMyEvents() {
    const res = await this.__sendTx(
      this.params.contract.getContract().methods.getMyEvents(),
      true,
    );
    return res.map(id => Numbers.fromHex(id));
  }

  /**
   * @typedef {Object} ExchangeContract~EventData
   * @property {number} _resultId
   * @property {string} name
   * @property {string} urlOracle
   * @property {boolean} isResolved
   */

  /**
   * Get EventData
   * @param {Object} event
   * @param {number} event.event_id
   * @return {Promise<ExchangeContract~EventData>}
   */
  async getEventData({ event_id }) {
    const r = await this.__sendTx(
      this.params.contract.getContract().methods.getEventData(event_id),
      true,
    );

    return {
      name: r[0],
      _resultId: Numbers.fromHex(r[1]),
      urlOracle: r[2],
      isResolved: r[3],
    };
  }

  /**
   * @typedef {Object} ExchangeContract~EventHoldings
   * @property {number} liquidityA
   * @property {number} liquidityB
   * @property {number} inPoolBalancesA
   * @property {number} inPoolBalancesB
   * @property {number} outPoolBalancesA
   * @property {number} outPoolBalancesB
   */

  /**
   * Get My Event Holdings
   * @param {Object} event
   * @param {number} event.event_id
   * @return {Promise<ExchangeContract~EventHoldings>}
   */
  async getMyEventHoldings({ event_id }) {
    const r = await this.__sendTx(
      this.params.contract.getContract().methods.getMyEventHoldings(event_id),
      true,
    );

    return {
      inPoolBalancesA: r[0],
      outPoolBalancesA: r[1],
      liquidityA: r[2],
      inPoolBalancesB: r[3],
      outPoolBalancesB: r[4],
      liquidityB: r[5],
    };
  }

  /**
   * @typedef {Object} ExchangeContract~SpaceData
   * @property {number} inPool
   * @property {number} amount
   * @property {number} fees
   * @property {number} cost
   * @property {number} liqAmount
   * @property {number} inPool
   * @property {number} outPool
   * @property {number} odd
   * @property {number} _id
   */

  /**
   * Get Result Space Data
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @return {Promise<ExchangeContract~SpaceData>}
   */
  async getResultSpaceData({ event_id, resultSpace_id }) {
    const r = await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.getResultSpaceData(event_id, resultSpace_id),
      true,
    );

    return {
      _id: Numbers.fromHex(r[0]),
      _resultId: Numbers.fromHex(r[1]),
      pool: Numbers.fromDecimals(r[2], 18),
      cost: Numbers.fromDecimals(r[3], 7),
      odd: Numbers.fromDecimals(r[4], 4),
      amount: Numbers.fromDecimals(r[5], 7),
      inPool: Numbers.fromDecimals(r[6], 7),
      outPool: Numbers.fromDecimals(r[7], 7),
      fees: Numbers.fromDecimals(r[8], 7),
      liqAmount: Numbers.fromDecimals(r[9], 7),
    };
  }

  /**
   * To see if Event is open
   * @returns {Promise<boolean>}
   */
  async isEventOpen() {
    return await this.params.contract
      .getContract()
      .methods.isEventOpen()
      .call();
  }

  /**
   * Get Fractions Cost
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @param {number} event.fractions_amount
   * @return {Promise<number>}
   */
  async getFractionsCost({ event_id, resultSpace_id, fractions_amount }) {
    return Numbers.fromDecimals(
      await this.__sendTx(
        this.params.contract
          .getContract()
          .methods.getFractionsCost(event_id, resultSpace_id, fractions_amount),
        true,
      ),
      18,
    );
  }

  /**
   * Get Slippage on Buy
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @param {number} event.fractions_amount
   * @returns {Promise<number>}
   */
  async getSlipageOnBuy({ event_id, resultSpace_id, fractions_amount }) {
    return await this.params.contract
      .getContract()
      .methods.getSlipageOnBuy(event_id, resultSpace_id, fractions_amount)
      .call();
  }

  /**
   * Get Slippage on Buy
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @param {number} event.fractions_amount
   * @returns {Promise<number>}
   */
  async getSlipageOnSell({ event_id, resultSpace_id, fractions_amount }) {
    return await this.params.contract
      .getContract()
      .methods.getSlipageOnSell(event_id, resultSpace_id, fractions_amount)
      .call();
  }


  /**
   * Create an Event
   * @function
   * @param {Object} event
   * @param {number[]} resultSpaceIds
   * @param {string} urlOracle
   * @param {string} eventName
   * @param {number} ethAmount
   * @return {Promise<TransactionObject>}
   */
  createEvent = async ({
    resultSpaceIds,
    urlOracle,
    eventName,
    ethAmount = 0,
  }) => {
    if (ethAmount == 0) {
      throw new Error('Eth Amount has to be > 0');
    }
    const ETHToWei = Numbers.toSmartContractDecimals(ethAmount, 18);
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.createEvent(resultSpaceIds, urlOracle, eventName),
      false,
      ETHToWei,
    );
  };

  /**
   * Resolve Event
   * @function
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @return {Promise<TransactionObject>}
   */
  resolveEvent = async ({ event_id, resultSpace_id }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.resolveEvent(event_id, resultSpace_id),
  );

  /**
   * Add Liquidity
   * @function
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.ethAmount
   * @return {Promise<TransactionObject>}
   */
  addLiquidity = async ({ event_id, ethAmount }) => {
    const ETHToWei = Numbers.toSmartContractDecimals(ethAmount, 18);
    return await this.__sendTx(
      this.params.contract.getContract().methods.addLiquidity(event_id),
      false,
      ETHToWei,
    );
  };

  /**
   * Remove Liquidity
   * @function
   * @param {Object} event
   * @param {number} event.event_id
   * @return {Promise<TransactionObject>}
   */
  removeLiquidity = async ({ event_id }) => await this.__sendTx(
    this.params.contract.getContract().methods.removeLiquidity(event_id),
  );

  /**
   * Buy Fractions
   * @function
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @param {number} event.fractions_amount
   * @return {Promise<TransactionObject>}
   */
  buy = async ({ event_id, resultSpace_id, fractions_amount }) => {
    // eslint-disable-next-line no-param-reassign
    fractions_amount = Numbers.toSmartContractDecimals(fractions_amount, 7);
    const ETHCost = await this.getFractionsCost({
      event_id,
      resultSpace_id,
      fractions_amount,
    });
    const ETHToWei = Numbers.toSmartContractDecimals(ETHCost, 18);
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.buy(event_id, resultSpace_id, fractions_amount),
      false,
      ETHToWei,
    );
  };

  /**
   * Sell Fractions
   * @function
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @param {number} event.fractions_amount
   * @return {Promise<TransactionObject>}
   */
  sell = async ({ event_id, resultSpace_id, fractions_amount }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.sell(event_id, resultSpace_id, fractions_amount),
  );

  /**
   * Take Fractions out of the pool
   * @function
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @param {number} event.fractions_amount
   * @return {Promise<TransactionObject>}
   */
  pullFractions = async ({ event_id, resultSpace_id, fractions_amount }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.pullFractions(event_id, resultSpace_id, fractions_amount),
  );

  /**
   * Move Fractions to the Pool
   * @function
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @param {number} event.fractions_amount
   * @return {Promise<TransactionObject>}
   */
  pushFractions = async ({ event_id, resultSpace_id, fractions_amount }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.pushFractions(event_id, resultSpace_id, fractions_amount),
  );

  /**
   * Withdraw Wins on end of Event
   * @function
   * @param {Object} event
   * @param {number} event.event_id
   * @param {number} event.resultSpace_id
   * @return {Promise<TransactionObject>}
   */
  withdrawWins = async ({ event_id, resultSpace_id }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.withdrawWins(event_id, resultSpace_id),
  );

  /**
   * Deploy the Pool Contract
   * @param {Object} params
   * @param {function():void} params.callback
   * @return {Promise<*|undefined>}
   */
  deploy = async ({ callback }) => {
    const params = [];
    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ExchangeContract;
