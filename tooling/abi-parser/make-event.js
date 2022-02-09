const parseOutput = require('./parse-output');

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

module.exports = makeEvent;
