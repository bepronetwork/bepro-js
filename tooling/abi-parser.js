const fs = require('fs');
const path = require('path');
const yargs = require(`yargs`);
const hideBin = require(`yargs/helpers`).hideBin;
const {camelCase, paramCase,} = require('change-case')
const AbiParser = require('./abi-parser/index');
const defaultConfig = require('./abi-parser/default-config');

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
  .alias(`j`, `json`)
  .describe(`j`, `json configuration file`)
  .demandOption([`f`,])
  .help(`h`)
  .alias(`h`, `help`)
  .argv;

if (!fs.existsSync(args.file))
  return console.log(`File ${args.file} not found`);

if (args.json && !fs.existsSync(args.json))
  return console.log(`Configuration file ${args.json} not found`)

/**
 * @type {{output:{interfaceDir: string; classDir: string; eventsDir: string}, overwrite: {interface: boolean; class: boolean; events: boolean}}}
 */
const options = {
  ... defaultConfig,
  ... args.json ? JSON.parse(fs.readFileSync(args.json, 'utf8')) : {},
};

if (!args.interfaceDir)
  args.interfaceDir = options?.output?.interfaceDir;

if (!args.classDir)
  args.classDir = options?.output?.classDir;

if (!args.eventsDir)
  args.eventsDir = options?.output?.eventsDir;

if (args.overwriteInterface === undefined)
  args.overwriteInterface = options?.overwrite?.interface;

if (args.overwriteClass === undefined)
  args.overwriteClass = options?.overwrite?.class;

if (args.overwriteInterface === undefined)
  args.overwriteEvents = options?.overwrite?.events;

const parsed = AbiParser(args.file, options);

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
