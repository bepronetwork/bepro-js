const {getSolidityType} = require('./solidity-types');
/**
 * @param {Contract~AbiOption~Input[]} outputs
 * @param {string} template
 * @param {boolean} useComponentName
 * todo parse output from canonicalName
 * @returns {string}
 */
const parseOutput = (outputs, template = `ContractCallMethod<%content%>`, useComponentName = false) => {
  if (!outputs?.length)
    return `ContractSendMethod`;

  const _templateContent = (o, index) => `'${useComponentName && o.name || Number(index)}': ${getSolidityType(o.type)};`;
  const _templateComponent = (o, index) => `'${o.name || index}': {${o.components.map(_templateMapper).join(``)}}${getSolidityType(o.type)};`;
  const _templateMapper = (o, index) => !o.components ? _templateContent(o, index) : _templateComponent(o, index);

  let content = outputs.map(_templateMapper).join(``);

  console.log(`content`,content);
  console.log(`outputs`,outputs);
  if (outputs.length === 1) {
    content = content.replace("'0': ", "");
    if (!outputs[0].name)
      content = content.replace(/;$/g, ``);
  } else content = `{${content}}`;

  return template.replace(`%content%`, content);
}

module.exports = parseOutput;
