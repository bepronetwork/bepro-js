const fs = require('fs');
const path = require('path');

/**
 * @type {"constructor"|"function"|"event"} L~Contract~AbiOption~Type
 */

/**
 * @type {"uint256"|"address"} L~Contract~AbiOption~InputType
 */

/**
 * @typedef {Object} L~Contract~AbiOption~Input
 * @property {string} internalType
 * @property {string} name
 * @property {string} type
 * @property {boolean} [indexed]
 */

/**
 * @typedef {Object} L~Contract~AbiOption
 * @property {string} type
 * @property {string} name
 * @property {L~Contract~AbiOption~Input[]} inputs
 * @property {L~Contract~AbiOption~Input[]} [outputs]
 * @property {boolean} [anonymous]
 * @property {string} [stateMutability]
 */

/**
 * @typedef L~Contract
 * @property {string} contractName
 * @property {L~Contract~AbiOption[]} abi
 */

// **

const classHeader = (name = `Name`) => `export class ${name} extends IContract`;
const makeClass = (header = ``, content = ``) =>
  `
  import { network as interface } from '../../interfaces';
  
  ${header} {
    constructor(params) {
      super({abi: interface, ...params});    
    }

    ${content}
  }`;

/**
 * @param {L~Contract~AbiOption~Input[]} inputs
 * @returns {string}
 */
const parseInputsName = (inputs) =>
  inputs.map(input => input.name).join(`, `);

const fnHeader = (name = ``, parsedInputs = ``, isAsync = true) =>
  `${isAsync ? `async` : ``} ${name}(${parsedInputs})`;

const getContractMethod = (name = ``, parsedInputs = ``) =>
  `this.params.getContract().methods.${name}(${parsedInputs})`

const sendTx = (name = ``, parsedInputs = ``, isAsync = true) =>
  `return ${isAsync ? `await` : ``} this.__sendTx(${getContractMethod(name, parsedInputs)})`;

const makeAtProp = (atProp = `param`) => ({type = ``, name = ``}) => `* @${atProp} {${type}} ${name}`;
const makeParam = makeAtProp(`param`);
const makeReturn = makeAtProp(`returns`);

/**
 *
 * @param {L~Contract~AbiOption~Input[]} outputs
 */
const parseOutputs = (outputs) => {
  let target = outputs || [];

  if (!target.length)
    target.push({type: `void`})

  if (target.length === 1)
    return outputs.map(makeReturn);

}

/**
 * @param {L~Contract~AbiOption~Input[]} inputs
 * @param {L~Contract~AbiOption~Input[]} outputs
 * @return {string}
 */
const paramsBlock = (inputs, outputs) => {
  return [
    `/**`,
    ...inputs.map(makeParam),
    ...(outputs?.length && outputs || [{type: `void`}])
      .map(({type, name}) => ({type: `Promise<${type}>`, name}))
      .map(makeReturn),
    `*/`
  ].join(`\n     `)
}


/**
 * @param {L~Contract~AbiOption} option
 * @return {string}
 */
const makeFn = (option) => {
  const parsedInputs = parseInputsName(option.inputs);

  return `
    ${paramsBlock(option.inputs, option.outputs)}
    ${fnHeader(option.name, parsedInputs)} {
      ${sendTx(option.name, parsedInputs)}    
    };
  `
}



const liquifySolidityContract = (filePath = ``) => {

  /**
   * @type {L~Contract}
   */
  const contract = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf-8'));

  const content = contract.abi
    .filter(option => !option.anonymous && option.type === "function")
    .map(makeFn)
    .join(`\n`);

  return makeClass(classHeader(contract.contractName), content)

}

console.log(liquifySolidityContract(`./build/contracts/Network.json`));
