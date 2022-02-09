pragma solidity ^0.8.0;

import "../ERC20.sol";

contract Network_v2 {
    constructor(address _settlerToken, address _transactionToken, address _governor) public {
        settlerToken = Token(_settlerToken);
        transactionToken = Token(_transactionToken);
        _governor = _governor;
    }

    Token public settlerToken;
    Token public transactionToken;

    uint256 public totalStaked = 0;
    uint256 public oraclesStaked = 0;

    uint256 public closedIdsCount = 0;

    uint256 public mergeCreatorFeeShare = 3;
    uint256 public percentageNeededForDispute = 3;

    uint256 public disputableTime = 3 days;
    uint256 public redeemTime = 1 days;

    uint256 public councilAmount = 25000000*10**18; // 25M * 10 to the power of 18 (decimals)

    struct PullRequest {
        string originRepo;
        string originCID;
        string originBranch;
        string userRepo;
        string userBranch;
        bool ready;
        uint256 cid; // pr id on git
    }

    struct ProposalDetail {
        address recipient;
        uint256 amount;
    }

    struct Proposal {
        uint256 id;
        uint256 creationDate;
        uint256 oracles;
        uint256 disputes;
        uint256 prId;

        ProposalDetail[] details;
    }

    struct Bounty {
        uint256 id;

        uint256 creationDate;
        uint256 tokensStaked;

        address issueGenerator;

        bool finalized;
        bool recognizedAsFinished; // we can infer this from "ready for review", and it can go back after "closed" or "disputed" -- we might be able to remove this prop / action and replace it for a more meaningfull one
        bool canceled;

        string title;
        string description; // dreaming, we can dream for a bit
        string repoPath;
        string branch;
        string cid;

        PullRequest[] pullRequests;
        Proposal[] proposals;
    }

    Bounty[] bounties;

    event BountyCreated(uint256 indexed id, address indexed generator, uint256 indexed amount);
    event BountyCanceled(uint256 indexed id);
    event BountyDistributed(uint256 indexed id, uint256 proposalId);
    event BountyClosed(uint256 indexed id);
    event BountyPullRequestCreated(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyPullRequestReadyForReview(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyPullRequestClosed(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyProposalCreated(uint256 indexed bountyId, uint256 proposalId);
    event BountyProposalDisputed(uint256 indexed bountyId, uint256 proposalId);
}
