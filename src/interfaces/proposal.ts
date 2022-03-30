import { ProposalDetail } from "@interfaces/proposal-detail";

export interface Proposal {
    id: number;
    creationDate: number;
    oracles: number;
    disputeWeight: number;
    prId: number;
    refusedByBountyOwner: boolean;
    creator: string;

    details: ProposalDetail[]
}