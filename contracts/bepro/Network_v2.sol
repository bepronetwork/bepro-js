pragma solidity ^0.8.0;

import "../ERC20.sol";
import "../math/SafeMath.sol";

contract Network_v2 {
    using SafeMath for uint256;

    constructor(address _settlerToken, address _transactionToken, address _governor) public {
        settlerToken = Token(_settlerToken);
        transactionToken = Token(_transactionToken);
        _governor = _governor;
    }

    Token public settlerToken;
    Token public transactionToken;

    address public _governor;

    uint256 public totalStaked = 0;
    uint256 public oraclesStaked = 0;

    uint256 public closedIdsCount = 0;

    uint256 public mergeCreatorFeeShare = 3;
    uint256 public percentageNeededForDispute = 3;

    uint256 public disputableTime = 3 days;
    uint256 public draftTime = 1 days;

    uint256 public councilAmount = 25000000*10**18; // 25M * 10 to the power of 18 (decimals)

    struct Oracle {
        uint256 oraclesDelegatedByOthers;
        uint256 tokensLocked;

        mapping(address => uint256) oraclesDelegated;
    }

    mapping(address => Oracle) oracles;

    struct PullRequest {
        string originRepo;
        string originCID;
        string originBranch;
        string userRepo;
        string userBranch;
        bool ready;
        uint256 cid; // pr id on git
        uint256 id;
    }

    struct ProposalDetail {
        address recipient;
        uint256 percentage;
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
        uint256 tokenAmount;

        address creator;

        bool closed;
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
    mapping(string => uint256) cidBountyId;
    mapping(address => uint256[]) bountiesOfAddress;

    event BountyCreated(uint256 indexed id, address indexed creator, uint256 indexed amount);
    event BountyCanceled(uint256 indexed id);
    event BountyDistributed(uint256 indexed id, uint256 proposalId);
    event BountyClosed(uint256 indexed id);
    event BountyPullRequestCreated(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyPullRequestReadyForReview(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyPullRequestClosed(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyProposalCreated(uint256 indexed bountyId, uint256 prId, uint256 proposalId);
    event BountyProposalDisputed(uint256 indexed bountyId, uint256 prId, uint256 proposalId);

    /// @dev Lock given amount into the oracle mapping
    function lock(uint256 tokenAmount) external payable {
        require(tokenAmount > 0, "Token amount has to be higher than 0");
        require(settlerToken.transferFrom(msg.sender, address(this), tokenAmount));

        Oracle storage oracle = oracles[msg.sender];

        if (oracle.tokensLocked != 0) {
            oracle.oraclesDelegated[msg.sender] = oracle.oraclesDelegated[msg.sender].add(tokenAmount);
            oracle.tokensLocked = oracle.tokensLocked.add(tokenAmount);
        } else {
            oracle.oraclesDelegated[msg.sender] = tokenAmount;
            oracle.tokensLocked = tokenAmount;
        }

        oraclesStaked = oraclesStaked.add(tokenAmount);
    }

    /// @dev Unlock from the oracle mapping
    function unlock(uint256 tokenAmount, address from) external payable {
        Oracle storage oracle = oracles[msg.sender];

        require(oracle.tokensLocked >= tokenAmount, "tokenAmount is higher than the amount of locked tokens");
        require(oracle.oraclesDelegated[from] >= tokenAmount, "tokenAmount is higher than the amount of delegated tokens to from address");

        oracle.tokensLocked = oracle.tokensLocked.sub(tokenAmount);
        oracle.oraclesDelegated[from] = oracle.oraclesDelegated[from].sub(tokenAmount);

        if (msg.sender != from) {
            oracles[from].oraclesDelegatedByOthers = oracles[from].oraclesDelegatedByOthers.sub(tokenAmount);
        }

        oraclesStaked = oraclesStaked.sub(tokenAmount);
        require(settlerToken.transfer(msg.sender, tokenAmount), "settlerToken failed to be transferred");
    }

    /// @dev Gives oracles from msg.sender to recipient
    function delegateOracles(uint256 tokenAmount, address recipient) external payable {
        require(recipient != address(0), "Must have address and not be 0 address");
        require(recipient != msg.sender, "Cant delegate to self, use lock()");

        Oracle storage oracle = oracles[msg.sender];
        uint256 senderAmount = oracle.oraclesDelegated[msg.sender];

        require(oracle.tokensLocked >= tokenAmount, "Not enough oracles");
        require(senderAmount >= tokenAmount, "Not enough locked tokens to delegate");

        oracle.oraclesDelegated[msg.sender] = senderAmount.sub(tokenAmount);
        oracle.oraclesDelegated[recipient] = oracle.oraclesDelegated[recipient].add(tokenAmount);
        oracles[recipient].oraclesDelegatedByOthers = oracles[recipient].oraclesDelegatedByOthers.add(tokenAmount);
    }

    /// @dev create a bounty
    function openBounty(uint256 tokenAmount, string cid, string title, string repoPath, string branch) external payable {
        Bounty memory bounty;
        bounty.cid = cid;
        bounty.title = title;
        bounty.repoPath = repoPath;
        bounty.branch = branch;
        bounty.creator = msg.sender;
        bounty.id = bounties.length;
        bounty.creationDate = block.timestamp;
        bounty.tokenAmount = tokenAmount;

        bounty.closed = false;
        bounty.canceled = false;

        cidBountyId[cid] = bounty.id;
        bountiesOfAddress[msg.sender].push(bounty.id);
        bounties.push(bounty);

        require(transactionToken.transferFrom(msg.sender, address(this), tokenAmount), "Failed to transfer");

        emit BountyCreated(bounty.id, msg.sender, tokenAmount);
    }

    /// @dev returns true if NOW is less than bounty create time plus draft time
    function isBountyInDraft(uint256 id) public view returns (bool) {
        return block.timestamp < bounties[id].creationDate.add(draftTime);
    }

    function getOraclesOf(address _address) public view returns (uint256) {
        Oracle memory oracle = oracles[_address];
        return oracle.oraclesDelegatedByOthers.add(oracle.oraclesDelegated[_address]);
    }

    /// @dev cancel a bounty
    function cancelBounty(uint256 id) external payable {
        require(bounties.length <= id, "Bounty does not exist");

        Bounty storage bounty = bounties[id];

        require(bounty.creator == msg.sender, "Must be issue creator");
        require(isBountyInDraft(id), "Draft time has passed");
        require(!bounty.closed, "Bounty must be open");
        require(!bounty.canceled, "Bounty was already canceled");

        bounty.canceled = true;

        require(transactionToken.transfer(msg.sender, bounty.tokenAmount), "Failed to transfer token amount to creator");

        emit BountyCanceled(id);
    }

    /// @dev update the value of a bounty with a new amount
    function updateBountyAmount(uint256 id, uint256 newTokenAmount) external payable {
        require(bounties.length <= id, "Bounty has to exist");

        Bounty storage bounty = bounties[id];

        require(bounty.creator == msg.sender, "Must be bounty creator");
        require(isBountyInDraft(id), "Draft time has passed");
        require(!bounty.canceled, "Bounty is canceled");
        require(!bounty.closed, "Bounty is closed");
        require(bounty.tokenAmount != newTokenAmount, "Cant be same amount");

        bounty.tokenAmount = newTokenAmount;

        uint256 previousAmount = bounty.tokenAmount;
        uint256 retrieveAmount = 0;

        if (newTokenAmount > previousAmount) {
            retrieveAmount = newTokenAmount.sub(previousAmount);
        } else {
            retrieveAmount = previousAmount.sub(newTokenAmount);
        }

        require(transactionToken.transfer(msg.sender, retrieveAmount), "Failed to transfer token amount to creator");
    }

    /// @dev create pull request for bounty id
    function createPullRequest(uint256 forBountyId, string originRepo, string originBranch, string originCID, string userRepo, string userBranch, uint256 cid) external payable {
        require(bounties.length <= forBountyId, "Bounty does not exist");

        Bounty storage bounty = bounties[forBountyId];
        require(!bounty.closed, "Bounty is closed");
        require(!bounty.canceled, "Bounty is canceled");

        PullRequest storage pullRequest;
        pullRequest.cid = cid;
        pullRequest.id = bounty.pullRequests.length;

        pullRequest.userBranch = userBranch;
        pullRequest.userRepo = userRepo;

        pullRequest.originBranch = originBranch;
        pullRequest.originRepo = originRepo;
        pullRequest.originCID = originCID;

        bounty.pullRequests.push(pullRequest);

        emit BountyPullRequestCreated(forBountyId, pullRequest.id);
    }

    /// @dev mark a PR ready for review
    function markPullRequestReadyForReview(uint256 bountyId, uint256 pullRequestId) external payable {
        require(bounties.length <= bountyId, "Bounty does not exist");
        require(bounties[bountyId].pullRequests.length <= pullRequestId, "Pull request does not exist");
        require(!bounties[bountyId].pullRequests[pullRequestId].ready, "Pull request already marked as ready");

        bounties[bountyId].pullRequests[pullRequestId].ready = true;

        emit BountyPullRequestReadyForReview(bountyId, pullRequestId);
    }

    /// @dev create a proposal with a pull request for a bounty
    function createBountyProposal(uint256 id, uint256 prId, ProposalDetail[] details) external payable {
        require(bounties.length <= id, "Bounty does not exist");
        require(bounties[id].pullRequests.length <= prId, "Pull request does not exist");
        require(getOraclesOf(msg.sender) >= councilAmount, "Need to be council");

        Bounty storage bounty = bounties[id];
        PullRequest storage pullRequest = bounty.pullRequests[prId];
        Proposal storage proposal;

        proposal.id = bounty.proposals.length;
        proposal.prId = prId;
        proposal.creationDate = block.timestamp;
        proposal.details = details;

        uint256 total = 0 + bounty.tokenAmount * mergeCreatorFeeShare / 100;

        for (uint i = 0; i < details.length; i++) {
            total = total.add(details[i].percentage * (100 - mergeCreatorFeeShare) / 100);
        }

        require(total == 100, "Total should amount to 100%");

        bounty.proposals.push(proposal);

        emit BountyProposalCreated(id, prId, proposal.id);
    }
}
