const fs = require("fs");
const path = require("path");
const {paramCase} = require("change-case");
const makeFn = require('./make-fn');
const makeEvent = require('./make-event')
const makeClass = require('./make-class')
const classHeader = require('./class-header')
const parseInputsName = require('./parse-input-name')

/**
 * @param {string} filePath
 * @returns {{_interface: string, _class: string, _events: string}}
 */
const AbiParser = (filePath = ``) => {

  /**
   * @type {Contract}
   */
  const contract = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf-8'));

  const abis = contract.abi.filter(option => !option.anonymous && option.type === "function");
  const events = contract.abi.filter(option => !option.anonymous && option.type === "event");

  const content = abis.map(option => makeFn(option, false)).join(`\n`);

  const _super = `super(web3Connection, ${contract.contractName}Json.abi as AbiItem[], contractAddress);`;
  const _constructor = `  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {\n    ${_super}\n  }\n\n`;

  const _classBody = abis.map(option => {
    const devdoc = Object.entries(contract?.devdoc?.methods).find(([key, value]) => key.startsWith(option.name) && value);
    return makeFn(option, true, devdoc?.length && (devdoc[1].notice || devdoc[1].details) || ``)
  }).concat(events.map(o => makeEvent(o, true))).join(`\n`);

  const abiItemConstructor = contract.abi.filter(option => !option.anonymous && option.type === "constructor");
  let constructorWithDeployer = ``;
  // if (abiItemConstructor.length) {
  const abiInputs = parseInputsName(abiItemConstructor[0]?.inputs || [])
  const deployOptions = `const deployOptions = {\n        data: ${contract.contractName}Json.bytecode,\n        arguments: [${parseInputsName(abiItemConstructor[0]?.inputs || [], undefined, true)}]\n    };`
  constructorWithDeployer = _constructor+`  async deployJsonAbi(${abiInputs}) {\n    ${deployOptions}\n\n    return this.deploy(deployOptions, this.web3Connection.Account);\n  }\n\n`;
  // }

  const _interface = makeClass(classHeader(contract.contractName), content, ["import {ContractSendMethod} from 'web3-eth-contract';", "import {ContractCallMethod} from '@methods/contract-call-method';"]);

  const classImports = [
    "import {Model} from '@base/model';",
    "import {Web3Connection} from '@base/web3-connection';",
    "import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';",
    "import {Deployable} from '@interfaces/deployable';",
    `import ${contract.contractName}Json from '@abi/${contract.contractName}.json';`,
    `import {${contract.contractName}Methods} from '@methods/${paramCase(contract.contractName)}';`,
    ... !events.length ? [] : [
      `import * as Events from '@events/${paramCase(contract.contractName.concat(`Events`))}';`,
      `import {PastEventOptions} from 'web3-eth-contract';`,
      `import {XEvents} from '@events/x-events';`
    ],
    "import {AbiItem} from 'web3-utils';",
  ]

  const _events = [`import {EventData, PastEventOptions} from 'web3-eth-contract';`, ...events.map((o) => makeEvent(o))].join(`\n`)

  const _class = makeClass(classHeader(contract.contractName, `class`, ` extends Model<${contract.contractName}Methods> implements Deployable`), (constructorWithDeployer || _constructor)+_classBody, classImports);

  return {_interface, _class, _events};
}

module.exports = AbiParser;
