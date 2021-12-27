import {fromSmartContractDate} from '@utils/numbers';
import {BlockNumberAndTimestamp} from '@interfaces/block-number-timestamp';

interface Params {'0': number; '1': number}

export default function blockNumberAndTimestamp({0: blockNumber, 1: timestamp}: Params): BlockNumberAndTimestamp {
  return {
    blockNumber,
    timestamp: fromSmartContractDate(timestamp)
  }
}
