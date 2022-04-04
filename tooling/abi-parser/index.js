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
 * @param {{paths: {base: string; interfaces: string; abi: string; methods: string; events: string}, asPackage: boolean}} options
 * @returns {{_interface: string, _class: string, _events: string}}
 */
const AbiParser = (filePath = ``, options) => {

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

  const abiInputs = parseInputsName(abiItemConstructor[0]?.inputs || [])
  const deployOptions = `const deployOptions = {\n        data: ${contract.contractName}Json.bytecode,\n        arguments: [${parseInputsName(abiItemConstructor[0]?.inputs || [], undefined, true)}]\n    };`
  constructorWithDeployer = _constructor+`  async deployJsonAbi(${abiInputs}) {\n    ${deployOptions}\n\n    return this.deploy(deployOptions, this.web3Connection.Account);\n  }\n\n`;

  const contractCallMethodImport = options.asPackage ? `@taikai/dappkit` : `${options.paths.methods}/contract-call-method`;

  const _interface = makeClass(classHeader(contract.contractName), content, [
    "import {ContractSendMethod} from 'web3-eth-contract';",
    `import {ContractCallMethod} from '${contractCallMethodImport}';`
  ]);

  const libs = [
    ... options.asPackage
      ? [`import {Model, Web3Connection, Web3ConnectionOptions, Deployable, XEvents} from '@taikai/dappkit'`]
      : [
        `import {Model} from '${options.paths.base}/model';`,
        `import {Web3Connection} from '${options.paths.base}/web3-connection';`,
        `import {Web3ConnectionOptions} from '${options.paths.interfaces}/web3-connection-options';`,
        `import {Deployable} from '${options.paths.interfaces}/deployable';`,
        `import {XEvents} from '${options.paths.events}/x-events';`,
      ]
  ]

  const classImports = [
    ... libs,
    `import ${contract.contractName}Json from '${options.paths.abi}/${contract.contractName}.json';`,
    `import {${contract.contractName}Methods} from '${options.paths.methods}/${paramCase(contract.contractName)}';`,
    ... !events.length ? [] : [
      `import * as Events from '${options.paths.events}/${paramCase(contract.contractName.concat(`Events`))}';`,
      `import {PastEventOptions} from 'web3-eth-contract';`,
    ],
    "import {AbiItem} from 'web3-utils';",
  ]

  const _events = [`import {EventData, PastEventOptions} from 'web3-eth-contract';`, ...events.map((o) => makeEvent(o))].join(`\n`)

  const _class = makeClass(classHeader(contract.contractName, `class`, ` extends Model<${contract.contractName}Methods> implements Deployable`), (constructorWithDeployer || _constructor)+_classBody, classImports);

  return {_interface, _class, _events};
}

module.exports = AbiParser;
