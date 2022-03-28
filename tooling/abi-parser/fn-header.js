const fnHeader = (name = ``, parsedInputs = ``, parsedOutputs = ``) =>
  `${name}(${parsedInputs})${ parsedOutputs && ': '.concat(parsedOutputs) || ''}`;

module.exports = fnHeader;
