export interface IPullRequest {
    originRepo: string;
    originCID: string;
    originBranch: string;
    userRepo: string;
    userBranch: string;

    ready: boolean;
    canceled: boolean;

    creator: string;
    cid: number;
    id: number;
}