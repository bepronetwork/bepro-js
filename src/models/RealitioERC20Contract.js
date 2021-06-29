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
	async getQuestionBestAnswer({ questionId }) {
		return await this.getContract().methods.resultFor(questionId).call();
	}

	/**
	 * @function submitAnswerERC20
	 * @description Submit Answer for a Question
	 * @param {bytes32} questionId
	 * @param {bytes32} answerId
	 * @param {Integer} amount
	 */
	submitAnswerERC20 = async({ questionId, answerId, amount }) => {
    let amountInDecimals = Numbers.toSmartContractDecimals(amount, 18);

		return await this.__sendTx(
			this.getContract().methods.submitAnswerERC20(
        questionId,
        answerId,
        0,
        amountInDecimals
      ),
			false
		);
  }

	/**
	* @function deploy
	* @description Deploy the export default RealitioERC20 Contract
	*/
	deploy = async ({callback}) => {
		let params = [];
		let res = await this.__deploy(params, callback);
		this.params.contractAddress = res.contractAddress;
		/* Call to Backend API */
		this.__assert();
		return res;
	};
}

export default RealitioERC20Contract;
