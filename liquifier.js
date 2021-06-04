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

// **

const arguments = yargs(hideBin(process.argv))
  .usage(`Usage: $0 [options]`)
  .alias(`f`, `file`)
  .nargs(`f`, 1)
  .describe(`f`, `File to parse`)
  .alias(`d`, `dir`)
  .default(`d`, `./`)
  .describe(`d`, `Output dir`)
  .alias(`i`, `interface-dir`)
  .describe(`i`, `Folder to create the interface file on`)
  .default(`i`, `./src/interfaces/`)
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


const makeClass = (header = ``, content = ``,) =>
  `${header} {
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

/**
 *
 * @param {string} name
 * @param {boolean} [optional]
 * @param {*} [defaultValue]
 * @return {string}
 */
const paramName = (name, optional, defaultValue) =>
  `${(optional||defaultValue) && `[` || ``}${name}${defaultValue !== undefined && `=${defaultValue}` || ``}${(optional||defaultValue) && `]` || ``}`

/**
 * @param {string} atProp
 * @returns {function({type?: *, name?: *}): string}
 */
const makeAtProp = (atProp = `param`) => ({type = ``, name = ``, optional, defaultValue}) =>
  `* @${atProp} {${type}} ${paramName(name, optional, defaultValue)}`


const makeParam = makeAtProp(`param`);
const makeReturn = makeAtProp(`returns`);
const makeProperty = makeAtProp(`property`);

/**
 * @param {Contract~AbiOption~Input[]} outputs
 * @param {string} className
 * @param {string} methodName
 * @param {string} [append="Type"]
 * @param {string} [typeDefType="Object"]
 * @return {string[]}
 */
const makeTypeDef = (outputs, className = ``, methodName = ``, append = `Type`, typeDefType = `Object`) => {
  return [
    `/** @typedef {${typeDefType}} ${className}~${methodName}${append}`,
    ...outputs.map(output => makeProperty({...output, name: output.name || `*`})),
    `*/`,
    ``
  ]
}

/**
 * @type {Contract~AbiOption~Input[]}
 */
const DEFAULT_ICONTRACT_OUTPUTS = [
  {type: `Boolean`, name: `test`},
  {type: `Boolean`, name: `localtest`},
  {type: `Web3Connection`, name: `web3Connection`, defaultValue: `Web3Connection`},
  {type: `address`, name: `contractAddress`, optional: true},
];

/**
 *
 * @param {Contract~AbiOption~Input[]} outputs
 * @param {string} name
 * @return {string[]}
 */
const makeConstructorTypeDef = (outputs, name) =>
  makeTypeDef(outputs.concat(...DEFAULT_ICONTRACT_OUTPUTS), name, `Options`, ``)

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
 *
 * @param {string} name
 * @param {Contract~AbiOption} option
 * @returns
 */
const classHeader = (name = `Name`, option = null) => [
  `import interface from '../../interfaces/${name}';`,
  ``,
  ...option?.inputs?.length && makeConstructorTypeDef(option.inputs, name) || [],
  `/**`,
  ` * ${name} Object`,
  ` * @class ${name}`,
  ` * @param {${name}~Options} options`,
  ` */`,
  `export class ${name} extends IContract`
].join(`\n`)

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
 * @returns {{filename: string, source: string interfaceFile: string, interfaceSource: string}}
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

  const constructorAbiOption = contract.abi.filter(({type}) => type === "constructor")[0];

  return {
    filename: `${contract.contractName}.js`,
    interfaceFile: `${contract.contractName}.json`,
    source: makeClass(classHeader(contract.contractName, constructorAbiOption), content),
    interfaceSource: `module.exports = require('../contracts/${contract.contractName}.json)`
  };

}


const liquified = liquifySolidityContract(arguments.file);
if (arguments.verbose)
  console.log(`Parsed`, arguments.file);

const sourceExists = fs.existsSync(path.resolve(path.normalize(arguments.dir, liquified.source)));
const interfaceExists = fs.existsSync(path.resolve(path.normalize(arguments.interfaceDir, liquified.interfaceFile)));

if (interfaceExists && arguments.override || !interfaceExists)
  if (!arguments.showoff)
    fs.writeFileSync(path.resolve(arguments.interfaceDir, liquified.interfaceFile), liquified.interfaceSource, `utf-8`);

if (sourceExists && arguments.override || !sourceExists)
  if (!arguments.showoff)
    fs.writeFileSync(path.resolve(arguments.dir, liquified.filename), liquified.source, `utf-8`);

if (arguments.verbose) {
  if (sourceExists && arguments.override || !sourceExists)
    console.log(`Wrote to ${path.resolve(arguments.dir, liquified.filename)} ${arguments.showoff && `(dry run, nothing written)` || ``}`, );
  else console.log(`Did not write to ${path.resolve(arguments.dir, liquified.filename)} because it existed and no override flag was given`);

  if (interfaceExists && arguments.override || !interfaceExists)
    console.log(`Wrote to ${path.resolve(arguments.interfaceDir, liquified.interfaceFile)} ${arguments.showoff && `(dry run, nothing written)` || ``}`, );
  else console.log(`Did not write to ${path.resolve(arguments.interfaceDir, liquified.interfaceFile)} because it existed and no override flag was given`);

}

if (arguments.SHOWOFF)
  console.log(liquified.source);
