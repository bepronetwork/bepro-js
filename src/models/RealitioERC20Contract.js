import _ from "lodash";
import moment from "moment";

import { realitio } from "../interfaces";
import Numbers from "../utils/Numbers";
import IContract from './IContract';

/**
 * Exchange Contract Object
 * @constructor RealitioERC20Contract
 * @param {Web3} web3
 * @param {Integer} decimals
 * @param {Address} contractAddress
 */

class RealitioERC20Contract extends IContract {
	constructor(params) {
		super({abi: realitio, ...params});
	}

	/**
	 * @function isQuestionFinalized
	 * @description Get My Porfolio
   * @param {bytes32} questionId
	 * @returns {bool} isFinalized
	 */
	async isQuestionFinalized({ questionId }) {
		return await this.getContract().methods.isFinalized(questionId).call();
	}

	/**
	 * @function getQuestion
	 * @description getQuestionBestAnswer
   * @param {bytes32} questionId
	 * @returns {Object} question
	 */
	async getQuestion({ questionId }) {
		return await this.getContract().methods.questions(questionId).call();
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

		const answers = await this.getContract().getPastEvents('LogNewAnswer', {
			fromBlock: 0,
			toBlock: 'latest',
			filter: { question_id: questionId, user }
		});

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
	submitAnswerERC20 = async({ questionId, answerId, amount }) => {
		return await this.__sendTx(
			this.getContract().methods.submitAnswerERC20(
        questionId,
        answerId,
        0,
        amount
      ),
			false
		);
  }
}

export default RealitioERC20Contract;
