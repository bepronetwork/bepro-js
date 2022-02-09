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

module.exports = {getSolidityType, SolidityTypes};
