import {fromSmartContractDate} from '@utils/numbers';

interface Params {'0': string; '1': undefined; '2': number; '3': string; '4': string[]; '5': number}

export default function poolInformation({
                                          0: creator, 1: status, 2: optionsSize,
                                          3: description, 4: voters, 5: expirationTime}: Params, _id: number) {
  return ({
    _id,
    creator,
    status,
    optionsSize,
    description,
    voters,
    expirationTime: fromSmartContractDate(expirationTime)
  })
}
