const {getSolidityType} = require('./solidity-types');

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

module.exports = parseInputsName;
