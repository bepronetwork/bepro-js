const SolidityTypes = {
  bool: `boolean`,
  address: `string`,
  "string": `string`,
  event: `void`,
  tuple: ``, // since we break down any typed tuple we can replace it for empty string
  "tuple[]": `` // since we break down any typed tuple we can replace it for empty string
}

const getSolidityType = (type = ``) => {
  const isArray = type.indexOf(`[]`) > -1;
  let retype = `any`;

  if (type.startsWith(`bytes`))
    retype = `string` + (isArray && `[]` || ``);
  else retype = type.indexOf(`int`) > -1 ? `number` : (SolidityTypes[type] || "") + (isArray && `[]` || ``);

  return retype;
}

module.exports = {getSolidityType, SolidityTypes};
