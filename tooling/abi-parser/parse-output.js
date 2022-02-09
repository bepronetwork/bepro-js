const {getSolidityType} = require('./solidity-types');
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

module.exports = parseOutput;
