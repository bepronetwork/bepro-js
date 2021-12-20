export function noExponents(n: string, explicitNum?: boolean) {
  // thanks to https://stackoverflow.com/a/43926485/587811

  let data, leader, mag, multiplier, num, sign, str, z;
  if (explicitNum == null) {
    explicitNum = true;
  }

  data = n.split(/[eE]/); // http://stackoverflow.com/a/18719988/1877527
  if (data.length === 1) {
    return data[0];
  }
  z = "";
  sign = n.slice(0, 1) === "-" ? "-" : "";
  str = data[0].replace(".", "");
  mag = Number(data[1]) + 1;
  if (mag <= 0) {
    z = sign + "0.";
    while (!(mag >= 0)) {
      z += "0";
      ++mag;
    }
    num = z + str.replace(/^\-/, "");
    if (explicitNum) {
      return parseFloat(num);
    } else {
      return num;
    }
  }
  if (str.length <= mag) {
    mag -= str.length;
    while (!(mag <= 0)) {
      z += 0;
      --mag;
    }
    num = str + z;
    if (explicitNum) {
      return parseFloat(num);
    } else {
      return num;
    }
  } else {
    leader = parseFloat(data[0]);
    multiplier = Math.pow(10, parseInt(data[1]));
    return leader * multiplier;
  }
}

export function toSmartContractDecimals(value: string|number, decimals = 18, explicit = false) {
  return noExponents((Number(value) * 10 ** decimals).toFixed(), explicit)
}

export function fromDecimals(value: string|number, decimals = 18, explicit = false) {
  return noExponents(parseFloat((Number(value) / 10 ** decimals).toString()).toPrecision(decimals), explicit)
}

export function toSmartContractDate(date: number|Date) {
  return (+new Date(date)) / 1000
}

export function fromSmartContractDate(date: number) {
  return +new Date(date*1000);
}
