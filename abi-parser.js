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
  .alias(`i`, `interfaceDir`)
  .describe(`i`, `directory to output interface file into`)
  .alias(`c`, `classDir`)
  .describe(`c`, `directory to output class file into`)
  .alias(`n`, `name`)
  .describe(`n`, `change the file name`)
  .alias(`I`, `overwriteInterface`)
  .describe(`I`, `allow interface file overwrite`)
  .alias(`C`, `overwriteClass`)
  .describe(`C`, `allow class file overwrite`)
  .alias(`e`, `eventsDir`)
  .describe(`e`, `directory to output events to`)
  .alias(`E`, `overwriteEvent`)
  .describe(`E`, `allow event interface file overwrite (events will be spawned on same folder as interface)`)
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

  if (outputs.length === 1 && (!outputs[0].components && !useComponentName))
    content = content.replace(`'0': `, ``).replace(`;`, ``);
  else content = `{${content}}`;

  return template.replace(`%content%`, content);
}

const parseComment = (comment = ``) => [`  /**`, `   * ${comment}`, `   */\n`].join(`\n`)

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
 * @param {string} [devDocMethods]
 * @return {string}
 */
const makeEvent = (option, withBody = false) => {

  if (!withBody)
    return `export interface ${option.name}Event ${parseOutput(option.inputs, `{ returnValues: %content% }`, true)}`

  return [
    `  async get${option.name}Events(filter: PastEventOptions): Promise<XEvents<Events.${option.name}Event>[]> {`,
    `    return this.contract.self.getPastEvents(\`${option.name}\`, filter)`,
    `  }\n`
  ].join(`\n`)
}


/**
 * @param {Contract~AbiOption} option
 * @param {boolean} [withBody]
 * @param {string} [devDocMethods]
 * @return {string}
 */
const makeFn = (option, withBody = false, devDoc = ``) => {
  const parsedInputs = parseInputsName(option.inputs);
  const parsedOutputs = parseOutput(option.outputs);

  const inputs = withBody && option.inputs.map(({name, type}, i) =>
    `${name || 'v'.concat(String(+i+1))}`).join(`, `) || '';

  const body = withBody && `{\n    return this.${option.outputs.length ? 'callTx' : 'sendTx'}(this.contract.methods.${option.name}(${inputs})); \n  }\n` || '';

  return `${devDoc && parseComment(devDoc) || ``}${withBody && '  async ' || '  '}${fnHeader(option.name, parsedInputs, !withBody && parsedOutputs || ``)}${withBody && body || ';'}`
}

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

if (!fs.existsSync(args.file))
  return console.log(`File ${args.file} not found`);

const parsed = AbiParser(args.file);


if (args.interfaceDir) {
  const outputFile = path.resolve(args.interfaceDir, paramCase(camelCase(path.basename(args.file))).replace(`-json`, `.ts`));
  if (fs.existsSync(outputFile) && !args.overwriteInterface)
    console.log(`\nInterface file already exists.\n${'-'.repeat(10)}\n\n`, parsed._interface);
  else {
    fs.writeFileSync(outputFile, parsed._interface, 'utf8')
    console.log(`Created`, outputFile);
  }
} else console.log(`\nInterface \n${'-'.repeat(10)}\n\n`, parsed._interface)

if (args.classDir) {
  const outputFile = path.resolve(args.classDir, paramCase(path.basename(args.file)).replace(`-json`, `.ts`));
  if (fs.existsSync(outputFile) && !args.overwriteClass)
    console.log(`\nClasss file already exists.\n${'-'.repeat(10)}\n\n`, parsed._class);
  else {
    fs.writeFileSync(outputFile, parsed._class, 'utf8')
    console.log(`Created`, outputFile);
  }
} else console.log(`\nClass \n${'-'.repeat(10)}\n\n`, parsed._class)

if (parsed._events && args.eventsDir) {
  const outputFile = path.resolve(args.eventsDir, paramCase(camelCase(path.basename(args.file)).concat(`Events`)).replace(`-json`, ``)).concat(`.ts`);
  if (fs.existsSync(outputFile) && !args.overwriteEvents)
    console.log(`\nEvents file already exists.\n${'-'.repeat(10)}\n\n`, parsed._events);
  else {
    fs.writeFileSync(outputFile, parsed._events, 'utf8')
    console.log(`Created`, outputFile);
  }
} else if (parsed._events) console.log(`\nEvents \n${'-'.repeat(10)}\n\n`, parsed._events)
