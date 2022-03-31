export interface ApprovalEvent { returnValues: {'owner': string;'approved': string;'tokenId': number;} }
export interface ApprovalForAllEvent { returnValues: {'owner': string;'operator': string;'approved': boolean;} }
export interface GovernorTransferredEvent { returnValues: {'previousGovernor': string;'newGovernor': string;} }
export interface TransferEvent { returnValues: {'from': string;'to': string;'tokenId': number;} }
