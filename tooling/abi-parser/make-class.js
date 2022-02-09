const makeClass = (header = ``, content = ``, imports = []) =>
  [...imports, "", `${header} {`, content, `}`].join(`\n`);

module.exports = makeClass;
