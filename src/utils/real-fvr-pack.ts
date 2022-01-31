import {fromDecimals} from '@utils/numbers';
import {RealFvrPack} from '@interfaces/real-fvr-pack';

interface Params {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': string;
  '5': string;
  '6': string;
  '7': string;
  '8': string[];
  '9': number[];
}



export default function realFvrPack({
                                       0: packId,
                                       1: packNumber,
                                       2: initialNFTID,
                                       3: price,
                                       4: serie,
                                       5: drop,
                                       6: packType,
                                       7: buyer,
                                       8: saleDistributionAddresses,
                                       9: saleDistributionAmounts
                                     }: Params, decimals = 18): RealFvrPack {
  return {
    packId,
    packNumber,
    initialNFTID,
    price: +fromDecimals(price, decimals),
    serie,
    drop,
    packType,
    buyer,
    saleDistributionAddresses,
    saleDistributionAmounts
  }
}
