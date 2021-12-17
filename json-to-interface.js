const fs = require('fs');
const path = require('path');
const yargs = require(`yargs`);
const hideBin = require(`yargs/helpers`).hideBin;
const {camelCase, paramCase} = require('change-case')

/**
 * @typedef {Object} Contract~AbiOption~Input
 * @property {string} internalType
 * @property {string} name
 * @property {string} type
 * @property {boolean} [indexed]
 * @property {boolean} [optional]
 * @property {*} [defaultValue]
 */

/**
 * @typedef {Object} Contract~AbiOption
 * @property {string} type
 * @property {string} name
 * @property {Contract~AbiOption~Input[]} inputs
 * @property {Contract~AbiOption~Input[]} [outputs]
 * @property {boolean} [anonymous]
 * @property {string} [stateMutability]
 */

/**
 * @typedef Contract
 * @property {string} contractName
 * @property {Contract~AbiOption[]} abi
 */

const args = yargs(hideBin(process.argv))
  .usage(`Usage: $0 [options]`)
  .alias(`f`, `file`)
  .nargs(`f`, 1)
  .describe(`f`, `File to parse`)
  .alias(`o`, `output`)
  .describe(`o`, `directory to output file into`)
  .demandOption([`f`,])
  .help(`h`)
  .alias(`h`, `help`)
  .argv;

const SolidityTypes = {
  bool: `boolean`,
  uint: `number`,
  uint256: `number`,
  address: `string`,
  "string": `string`,
  event: `void`,
  "address[]": `string[]`,
  "uint256[]": `number[]`,
  "uint[]": `number[]`,
  "string[]": `string[]`,
}

const makeClass = (header = ``, content = ``,) =>
  ["import {ContractSendMethod} from 'web3-eth-contract';", "import {ContractCallMethod} from '@methods/contract-call-method';", "", `${header} {`, content, `}`].join(`\n`);

/**
 * @param {Contract~AbiOption~Input[]} inputs
 * @param {string} [joiner]
 * @returns {string}
 */
const parseInputsName = (inputs, joiner = `, `) =>
  inputs.map((input, i) => `${input.name || `v${i+1}`}: ${SolidityTypes[input.type]}`).join(joiner);

/**
 * @param {Contract~AbiOption~Input[]} outputs
 * @returns {string}
 */
const parseOutput = (outputs) => {
  if (!outputs.length)
    return `ContractSendMethod`;

  const template = `ContractCallMethod<%content%>`;

  let content = outputs.map((o, index) => `'${index}': ${SolidityTypes[o.type]}`).join(`; `);

  if (outputs.length === 1)
    content = content.replace(`'0': `, ``).replace(`;`, ``);
  else content = `{${content}}`;

  return template.replace(`%content%`, content);
}

const fnHeader = (name = ``, parsedInputs = ``, parsedOutputs) =>
  `${name}(${parsedInputs}): ${parsedOutputs}`;

/**
 *
 * @param {string} name
 * @returns
 */
const classHeader = (name = `Name`) => `export interface ${name}Methods`

/**
 * @param {Contract~AbiOption} option
 * @return {string}
 */
const makeFn = (option) => {
  const parsedInputs = parseInputsName(option.inputs);
  const parsedOutputs = parseOutput(option.outputs);

  return `  ${fnHeader(option.name, parsedInputs, parsedOutputs)};`
}

/**
 * @param {string} filePath
 * @returns {string}
 */
const JsonToInterface = (filePath = ``) => {

  /**
   * @type {Contract}
   */
  const contract = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf-8'));

  const content = contract.abi
                          .filter(option => !option.anonymous && option.type === "function")
                          .map(option => makeFn(option))
                          .join(`\n`);

  // const constructorAbiOption = contract.abi.filter(({type}) => type === "constructor")[0];

  return makeClass(classHeader(contract.contractName), content);
}


const parsed = JsonToInterface(args.file);
console.log(parsed);

if (args.output) {
  fs.writeFileSync(path.resolve(args.output, paramCase(camelCase(path.basename(args.file))).replace(`-json`, `.ts`)), parsed, 'utf8')
  console.log(`Outputed`);
}
