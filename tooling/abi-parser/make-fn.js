const parseInputsName = require('./parse-input-name')
const parseOutput = require('./parse-output')
const fnHeader = require('./fn-header')
const parseComment = require('./parse-comment')

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

module.exports = makeFn;
