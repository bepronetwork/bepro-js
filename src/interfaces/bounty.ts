import { IProposal } from "@interfaces/proposal";
import { IBenefactor } from "@interfaces/benefactor";
import { IPullRequest } from "@interfaces/pull-request";

export interface IBounty {
    id: number;
    creationDate: number;
    tokenAmount: number;

    creator: string;
    transactional: string;
    rewardToken: string;
    rewardAmount: number;
    fundingAmount: number;

    closed: boolean;
    canceled: boolean;
    funded: boolean;

    title: string;
    repoPath: string;
    branch: string;
    cid: string;

    closedDate: number;

    pullRequests: IPullRequest[];
    proposals: IProposal[];
    //benefactors: IBenefactor[];
    funding: IBenefactor[];
}