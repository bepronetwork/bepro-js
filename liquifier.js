#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require(`yargs`);
const hideBin = require(`yargs/helpers`).hideBin;


/**
 * @typedef {Object} Contract~AbiOption~Input
 * @property {string} internalType
 * @property {string} name
 * @property {string} type
 * @property {boolean} [indexed]
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

// **

const arguments = yargs(hideBin(process.argv))
  .usage(`Usage: $0 [options]`)
  .alias(`f`, `file`)
  .nargs(`f`, 1)
  .describe(`f`, `File to parse`)
  .alias(`d`, `dir`)
  .default(`d`, `./`)
  .describe(`d`, `Output dir`)
  .alias(`o`, `override`)
  .describe(`o`, `Override existing output file on -d`)
  .boolean(`o`)
  .default(`o`, false)
  .alias(`s`, `showoff`)
  .describe(`s`, `Dry run`)
  .boolean(`s`)
  .default(`s`, false)
  .alias(`S`, `SHOWOFF`)
  .describe(`S`, `Dry run with show source at the end`)
  .boolean(`S`)
  .default(`S`, false)
  .alias(`v`, `verbose`)
  .describe(`v`, `Blablabla blabla, bla blaa!`)
  .boolean(`v`)
  .default(`v`, false)
  .demandOption([`f`,])
  .help(`h`)
  .alias(`h`, `help`)
  // .epilog('copyright bepro')
  .argv;

// **

if (arguments.SHOWOFF)
  arguments.showoff = true;

if (arguments.showoff)
  arguments.verbose = arguments.v = true;

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
 * @param {Contract~AbiOption~Input[]} inputs
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
const makeProperty = makeAtProp(`property`);

/**
 * @param {Contract~AbiOption~Input[]} outputs
 * @param {string} className
 * @param {string} methodName
 */
const makeTypeDef = (outputs, className = ``, methodName = ``) => {
  return [
    `/** @typedef {Object} ${className}~${methodName}Type`,
    ...outputs.map(output => makeProperty({type: output.type, name: output.name || `*`})),
    `*/`,
    ``
  ]
}

/**
 * @param {Contract~AbiOption} option
 * @param {string} contractName
 * @return {string}
 */
const paramsBlock = (option, contractName) => {

  const needsTypeDef = option.outputs?.length > 1;
  if (!option.outputs)
    option.outputs = [];
  
  if (!option.outputs.length)
    option.outputs.push({type: `void`});

  if (!needsTypeDef)
    option.outputs[0].type = `Promise<${option.outputs[0].type}>`;

  return [
    ...(needsTypeDef && makeTypeDef(option.outputs, contractName, option.name) || []),
    `/**`,
    ...option.inputs.map(makeParam),
    needsTypeDef && makeReturn({type: `Promise<${contractName}~${option.name}>`}) || makeReturn(option.outputs[0]),
    `*/`
  ].join(`\n     `)
}


/**
 * @param {Contract~AbiOption} option
 * @param {string} contractName
 * @return {string}
 */
const makeFn = (option, contractName) => {
  const parsedInputs = parseInputsName(option.inputs);

  return `
    ${paramsBlock(option, contractName)}
    ${fnHeader(option.name, parsedInputs)} {
      ${sendTx(option.name, parsedInputs)}    
    };
  `
}

/**
 * @param {string} filePath 
 * @returns {{filename: string, source: string}}
 */
const liquifySolidityContract = (filePath = ``) => {

  if (arguments.verbose)
    console.log(`Loading ${filePath}`);

  /**
   * @type {Contract}
   */
  const contract = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf-8'));

  if (arguments.verbose)
    console.log(`Parsing ${contract.contractName}`)

  const content = contract.abi
    .filter(option => !option.anonymous && option.type === "function")
    .map(option => makeFn(option, contract.contractName))
    .join(`\n`);

  return {
    filename: `${contract.contractName}.js`,
    source: makeClass(classHeader(contract.contractName), content),
  };

}


const liquified = liquifySolidityContract(arguments.file);
if (arguments.verbose)
  console.log(`Parsed`);


const exists = fs.existsSync(path.resolve(path.normalize(arguments.dir, liquified.source)));

if (exists && arguments.override || !exists)
  if (!arguments.showoff)
    fs.writeFileSync(path.resolve(arguments.dir, liquified.filename), liquified.source, `utf-8`);

if (arguments.verbose) {
  if (exists && arguments.override || !exists)
    console.log(`Wrote to ${path.resolve(arguments.dir, liquified.filename)} ${arguments.showoff && `(dry run, nothing written)` || ``}`, );
  else console.log(`Did not write to ${path.resolve(arguments.dir, liquified.filename)} because it existed and no override flag was given`)
}

if (arguments.SHOWOFF)
  console.log(`Would write\n`, liquified.source);
