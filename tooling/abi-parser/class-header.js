/**
 *
 * @param {string} name
 * @param {string} type
 * @param {string} nameAppendix
 * @returns
 */
const classHeader = (name = `Name`, type = `interface`, nameAppendix = `Methods`) =>
  `export ${type} ${name}${nameAppendix}`

module.exports = classHeader;
