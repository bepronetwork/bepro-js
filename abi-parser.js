const fs = require('fs');
const path = require('path');
const yargs = require(`yargs`);
const hideBin = require(`yargs/helpers`).hideBin;
const {camelCase, paramCase, capitalCase} = require('change-case')

/**
 * @typedef {Object} Contract~AbiOption~Input
 * @property {string} internalType
 * @property {string} name
 * @property {string} type
 * @property {boolean} [indexed]
 * @property {boolean} [optional]
 * @property {Contract~AbiOption~Input[]} [components]
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
  .alias(`o`, `outputInterface`)
  .describe(`o`, `directory to output interface file into`)
  .alias(`g`, `generateClass`)
  .describe(`g`, `directory to output class file into`)
  .demandOption([`f`,])
  .help(`h`)
  .alias(`h`, `help`)
  .argv;

const SolidityTypes = {
  bool: `boolean`,
  address: `string`,
  "string": `string`,
  event: `void`,
}

const getSolidityType = (type = ``) => {
  const isArray = type.search(`[]`) > -1;
  let retype = `any`;

  if (type.startsWith(`bytes`))
    retype = `string` + (isArray && `[]` || ``);
  else retype = type.search(`int`) > -1 ? `number` : SolidityTypes[type] + (isArray && `[]` || ``);

  return retype;
}

const makeClass = (header = ``, content = ``, imports = []) =>
  [...imports, "", `${header} {`, content, `}`].join(`\n`);

/**
 * @param {Contract~AbiOption~Input[]} outputs
 * @param {string} template
 * @param {boolean} template
 * @returns {string}
 */
const parseOutput = (outputs, template = `ContractCallMethod<%content%>`, useComponentName = false) => {
  if (!outputs?.length)
    return `ContractSendMethod`;

  const _templateContent = (o, index, type) => `'${useComponentName && o.name || index}': ${getSolidityType(type)}`
  const _templateMapper = (o, index) => !o.components ? _templateContent(o, index, o.type) : o.components.map(_templateMapper).join(`; `);

  let content = outputs.map(_templateMapper).join(`; `);

  if (outputs.length === 1 && !outputs[0].components)
    content = content.replace(`'0': `, ``).replace(`;`, ``);
  else content = `{${content}}`;

  return template.replace(`%content%`, content);
}


/**
 * @param {Contract~AbiOption~Input[]} inputs
 * @param {string} [joiner]
 * @param {boolean} [noType]
 * @returns {string}
 */
const parseInputsName = (inputs, joiner = `, `, noType = false) =>
  inputs?.map((input, i) =>
    input.components?.length
      ? `params: `+parseOutput([input], `%content%`, true)
      : `${input.name || `v${i+1}`}${!noType && ': '.concat(getSolidityType(input.type)) || ''}`)?.join(joiner);

const fnHeader = (name = ``, parsedInputs = ``, parsedOutputs = ``) =>
  `${name}(${parsedInputs}) ${ parsedOutputs && ':'.concat(parsedOutputs) || ''}`;

/**
 *
 * @param {string} name
 * @param {string} type
 * @param {string} nameAppendix
 * @returns
 */
const classHeader = (name = `Name`, type = `interface`, nameAppendix = `Methods`) =>
  `export ${type} ${name}${nameAppendix}`

/**
 * @param {Contract~AbiOption} option
 * @param {boolean} [withBody]
 * @return {string}
 */
const makeFn = (option, withBody = false) => {
  const parsedInputs = parseInputsName(option.inputs);
  const parsedOutputs = parseOutput(option.outputs);

  const inputs = withBody && option.inputs.map(({name, type}, i) =>
    `${name || 'v'.concat(String(+i+1))}`).join(`, `) || '';

  const body = withBody && `{\n    return this.${option.outputs.length ? 'callTx' : 'sendTx'}(this.contract.methods.${option.name}(${inputs})); \n  }\n` || '';

  return `  ${withBody && 'async ' || ''}${fnHeader(option.name, parsedInputs, !withBody && parsedOutputs || ``)}${withBody && body || ';'}`
}

/**
 * @param {string} filePath
 * @returns {string}
 */
const AbiParser = (filePath = ``) => {

  /**
   * @type {Contract}
   */
  const contract = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf-8'));

  const abis = contract.abi.filter(option => !option.anonymous && option.type === "function");

  const content = abis.map(option => makeFn(option)).join(`\n`);

  const _super = `super(web3Connection, ${contract.contractName}Json.abi as AbiItem[], contractAddress);`;
  const _constructor = `  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {\n    ${_super}\n  }\n\n`;

  const _classBody = abis.map(option => makeFn(option, true)).join(`\n`);

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
    "import {AbiItem} from 'web3-utils';"
  ]

  const _class = makeClass(classHeader(contract.contractName, `class`, ` extends Model<${contract.contractName}Methods> implements Deployable`), (constructorWithDeployer || _constructor)+_classBody, classImports);

  return {_interface, _class};
}

if (!fs.existsSync(args.file))
  return console.log(`File ${args.file} not found`);

const parsed = AbiParser(args.file);


if (args.outputInterface) {
  const outputFile = path.resolve(args.outputInterface, paramCase(camelCase(path.basename(args.file))).replace(`-json`, `.ts`));
  fs.writeFileSync(outputFile, parsed._interface, 'utf8')
  console.log(`Created`, outputFile);
} else console.log(`// Interface \n\n`, parsed._interface)

if (args.generateClass) {
  const outputFile = path.resolve(args.generateClass, paramCase(path.basename(args.file)).replace(`-json`, `.ts`));
  fs.writeFileSync(outputFile, parsed._class, 'utf8')
  console.log(`Created`, outputFile);
} else console.log(`// Class \n\n`, parsed._class)
