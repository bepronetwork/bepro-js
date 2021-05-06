import { openerRealFvr } from "../../interfaces";
import Numbers from "../../utils/Numbers";
import _ from "lodash";
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * OpenerRealFvr Object
 * @class OpenerRealFvr
 * @param params.web3 {Web3}
 * @param params.contractAddress {Address}
 * @param params.acc {*}
 * @param params.realFvrAddress {*}
 * @param params.abi {realFvr}
 */
class OpenerRealFvr extends IContract {
  constructor(params) {
    super({abi: openerRealFvr, ...params});
  }

  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error("Contract is not deployed, first deploy it and provide a contract address");
    }

    // Use ABI
    this.params.contract.use(openerRealFvr, this.getAddress());

    // Set Token Address Contract for easy access
    this.params.ERC20Contract = new ERC20Contract({
      web3: this.web3,
      contractAddress: this.realFvrAddress,
      acc: this.acc
    });

    // Assert Token Contract
    await this.params.ERC20Contract.__assert();
  }


	/**
	 * @description User deploys the contract
	 * @param {String} name Name of the Contract
	 * @param {String} symbol Symbol of the Contract
	 * @param {Address} tokenAddress token Address of the purchase Token in use
	 * @returns {Boolean} Success the Tx Objection if operation was successful
	 */
  deploy = async ({name, symbol, tokenAddress, callback}) => {
    let params = [name, symbol, tokenAddress];
    let res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  getERC20Contract = () => this.params.ERC20Contract;

}

export default OpenerRealFvr;
