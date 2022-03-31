import { Proposal } from "@interfaces/proposal";
import { Benefactor } from "@interfaces/benefactor";
import { PullRequest } from "@interfaces/pull-request";

export interface Bounty {
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
    githubUser: string;

    closedDate: number;

    pullRequests: PullRequest[];
    proposals: Proposal[];
    //benefactors: Benefactor[];
    funding: Benefactor[];
}