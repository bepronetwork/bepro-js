import { IProposalDetail } from "@interfaces/proposal-detail";

export interface IProposal {
    id: number;
    creationDate: number;
    oracles: number;
    disputeWeight: number;
    prId: number;
    refusedByBountyOwner: boolean;
    creator: string;

    details: IProposalDetail[]
}