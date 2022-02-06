import {RealFevrMarketplaceDistributions} from '@interfaces/real-fevr-marketplace-distributions';

interface Params {
  '0': string[];
  '1': string[];
}

export default function realFevrMarketplaceDistributions({
  0: distributionAmounts,
  1: distributionAddresses,
}: Params): RealFevrMarketplaceDistributions {
  return {
    distributionAmounts: distributionAmounts.map(function(a: string) { return parseInt(a, 10); }),
    distributionAddresses,
  }
}
