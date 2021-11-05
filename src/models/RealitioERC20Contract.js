const _ =  require("lodash");
const moment = require("moment");

const realitio = require("../interfaces").realitio;
const Numbers = require( "../utils/Numbers");
const IContract = require( './IContract');

/**
 * RealitioERC20 Contract Object
 * @constructor RealitioERC20Contract
 * @param {Web3} web3
 * @param {Integer} decimals
 * @param {Address} contractAddress
 */

class RealitioERC20Contract extends IContract {
	constructor(params) {
		super({abi: realitio, ...params});
		this.contractName = 'realitio';
	}

	/**
	 * @function getQuestion
	 * @description getQuestion
   * @param {bytes32} questionId
	 * @returns {Object} question
	 */
	async getQuestion({ questionId }) {
		const question = await this.getContract().methods.questions(questionId).call();
		const isFinalized = await this.getContract().methods.isFinalized(questionId).call();
		const isClaimed = isFinalized && question.history_hash === Numbers.nullHash();

		return {
			id: questionId,
			bond: Numbers.fromDecimalsNumber(question.bond, 18),
			bestAnswer: question.best_answer,
			finalizeTs: question.finalize_ts,
			isFinalized,
			isClaimed
		};
	}

	/**
	 * @function getQuestionBestAnswer
	 * @description getQuestionBestAnswer
   * @param {bytes32} questionId
	 * @returns {bytes32} answerId
	 */
	async getQuestionBestAnswer({ questionId }) {
		return await this.getContract().methods.getBestAnswer(questionId).call();
	}

	/**
	 * @function resultForQuestion
	 * @description resultForQuestion - throws an error if question is not finalized
   * @param {bytes32} questionId
	 * @returns {bytes32} answerId
	 */
	async getResultForQuestion({ questionId }) {
		return await this.getContract().methods.resultFor(questionId).call();
	}

	/**
	 * @function getQuestionBondsByAnswer
	 * @description getQuestionBondsByAnswer - throws an error if question is not finalized
   * @param {bytes32} questionId
	 * @returns {Object} bonds
	 */
	async getQuestionBondsByAnswer({ questionId, user }) {
		const bonds = {};

		const answers = await this.getEvents('LogNewAnswer', { question_id: questionId, user });

		answers.forEach((answer) => {
			const answerId = answer.returnValues.answer;

			if (!bonds[answerId]) bonds[answerId] = 0;

			bonds[answerId] += Numbers.fromDecimalsNumber(answer.returnValues.bond, 18);
		});

		return bonds;
	}

	/**
	 * @function submitAnswerERC20
	 * @description Submit Answer for a Question
	 * @param {bytes32} questionId
	 * @param {bytes32} answerId
	 * @param {Integer} amount
	 */
	async submitAnswerERC20({ questionId, answerId, amount }) {
		let amountDecimals = Numbers.toSmartContractDecimals(amount, 18);

		return await this.__sendTx(
			this.getContract().methods.submitAnswerERC20(
        questionId,
        answerId,
        0,
        amountDecimals
      ),
			false
		);
  }

	/**
	 * @function getMyBonds
	 * @description Get My Bonds
	 * @returns {Array} Outcome Shares
	 */
	async getMyBonds() {
		const account = await this.getMyAccount();
		if (!account) return {};

		const events = await this.getEvents('LogNewAnswer', { user: account });
		const claimEvents = await this.getEvents('LogClaim', { user: account });
		const withdrawEvents = await this.getEvents('LogWithdraw', { user: account });

		const lastWithdrawBlockNumber = withdrawEvents[withdrawEvents.length - 1]
			? withdrawEvents[withdrawEvents.length - 1].blockNumber
			: 0;

		const bonds = {};

		// iterating through every answer and summing up the bonds
		events.forEach((event) => {
			const questionId = event.returnValues.question_id;

			// initializing bond vars
			if (!bonds[questionId]) bonds[questionId] = { total: 0, answers: {}, claimed: 0, withdrawn: false };
			if (!bonds[questionId].answers[event.returnValues.answer]) {
				bonds[questionId].answers[event.returnValues.answer] = 0;
			}

			const bond = Numbers.fromDecimalsNumber(event.returnValues.bond, 18)

			bonds[questionId].total += bond;
			bonds[questionId].answers[event.returnValues.answer] += bond;
		});

		claimEvents.forEach((event) => {
			const questionId = event.returnValues.question_id;

			const amount = Numbers.fromDecimalsNumber(event.returnValues.amount, 18)

			bonds[questionId].claimed += amount;

			// withdraw occurred after claim, marking as withdrawn
			if (lastWithdrawBlockNumber >= event.blockNumber) bonds[questionId].withdrawn = true;
		});

		return bonds;
	}


	/**
	 * @function getMyActions
	 * @description Get My Actions
	 * @returns {Array} Actions
	 */
	async getMyActions() {
		const account = await this.getMyAccount();
		if (!account) return [];

		const events = await this.getEvents('LogNewAnswer', { user: account });

		return events.map(event => {
			return {
				action: 'Bond',
				questionId: event.returnValues.question_id,
				answerId: event.returnValues.answer,
				value: Numbers.fromDecimalsNumber(event.returnValues.bond, 18),
				timestamp: Numbers.fromBigNumberToInteger(event.returnValues.ts, 18),
				transactionHash: event.transactionHash
			}
		})
	}

	/**
	 * @function claimWinnings
	 * @description claimWinnings
	 * @param {bytes32} questionId
	 */
	async claimWinningsAndWithdraw({ questionId }) {
		const question = await this.getQuestion({ questionId });

		// assuring question state is finalized
		if (!question.isFinalized) return false;

		if (question.isClaimed) {
			// question already claimed, only performing a withdraw action
			return await this.__sendTx(
				this.getContract().methods.withdraw(),
				false
			);
		}

		const events = await this.getEvents('LogNewAnswer', { question_id: questionId });

		const historyHashes = events.map((event) => event.returnValues.history_hash).slice(0, -1).reverse();
		// adding an empty hash to the history hashes
		historyHashes.push(Numbers.nullHash());

		const addrs = events.map((event) => event.returnValues.user).reverse();
		const bonds = events.map((event) => event.returnValues.bond).reverse();
		const answers = events.map((event) => event.returnValues.answer).reverse();

		return await this.__sendTx(
			this.getContract().methods.claimMultipleAndWithdrawBalance(
				[questionId],
				[historyHashes.length],
				historyHashes,
				addrs,
				bonds,
				answers
      ),
			false
		);
	}
}

module.exports = RealitioERC20Contract;
