import {fromDecimals} from '@utils/numbers';
import {RealFevrPack} from '@interfaces/real-fevr-pack';

interface Params {
  '0': number;
  '1': number;
  '2': number;
  '3': string;
  '4': string;
  '5': string;
  '6': string;
  '7': string[];
  '8': number[];
  '9': boolean;
}

export default function realFevrPack({
  0: packId,
  1: initialNFTID,
  2: price,
  3: serie,
  4: drop,
  5: packType,
  6: buyer,
  7: saleDistributionAddresses,
  8: saleDistributionAmounts,
  9: opened,
}: Params, decimals = 18): RealFevrPack {
  return {
    packId,
    initialNFTID,
    price: +fromDecimals(price, decimals),
    serie,
    drop,
    packType,
    buyer,
    saleDistributionAddresses,
    saleDistributionAmounts,
    opened,
  }
}
