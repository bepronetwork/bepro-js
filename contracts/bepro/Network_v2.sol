pragma solidity >=0.6.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../ERC20.sol";
import "../math/SafePercentMath.sol";
import "../utils/Governed.sol";

contract Network_v2 is Governed, ReentrancyGuard {
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

    uint256 public closedBounties = 0;

    uint256 public mergeCreatorFeeShare = 3;
    uint256 public percentageNeededForDispute = 3;

    uint256 public disputableTime = 3 days;
    uint256 public draftTime = 1 days;

    uint256 public councilAmount = 25000000*10**18; // 25M * 10 to the power of 18 (decimals)
    uint256 public minimumCouncilAmount = 25000*10**18; // 25K * 10 to the power of 18 (decimals)

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
        bool canceled;
        address creator;
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
    event BountyPullRequestCanceled(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyProposalCreated(uint256 indexed bountyId, uint256 prId, uint256 proposalId);
    event BountyProposalDisputed(uint256 indexed bountyId, uint256 prId, uint256 proposalId);

    function getBounty(uint256 id) public view returns (Bounty memory bounty) {
        require(bounties.length <= id, "Bounty does not exist");
        return bounties[id];
    }

    function getPullRequest(uint256 bountyId, uint256 pullRequestId) public view returns (PullRequest memory pullRequest) {
        Bounty memory bounty = getBounty(bountyId);
        require(bounty.pullRequests.length <= pullRequestId, "Pull request does not exist");
        return bounty.pullRequests[pullRequestId];
    }

    function getProposal(uint256 bountyId, uint256 proposalId) public view returns (Proposal memory proposal) {
        Bounty memory bounty = getBounty(bountyId);
        require(bounty.proposals.length <= proposalId, "Proposal does not exist");
        return bounty.proposals[proposalId];
    }

    function changeCouncilAmount(uint256 newAmount) public payable onlyGovernor {
        require(councilAmount >= 100000*10**settlerToken.decimals(), "Council Amount has to higher than 100k");
        require(councilAmount <= 50000000*10**settlerToken.decimals(), "Council Amount has to lower than 50M");
        councilAmount = newAmount;
    }

    function changeRedeemTime(uint256 _redeemTime) public payable onlyGovernor {
        require(_redeemTime <= 20 days, "Time has to be lower than 20 days");
        require(_redeemTime >= 1 minutes, "Time has to be higher than 1 minutes");
        redeemTime = _redeemTime;
    }

    function changeDisputableTime(uint256 _disputableTime) public payable onlyGovernor {
        require(_disputableTime < 20 days, "Time has to be lower than 20 days");
        require(_disputableTime >= 1 minutes, "Time has to be higher than 1 minutes");
        disputableTime = _disputableTime;
    }

    function changePercentageNeededForDispute(uint256 _percentageNeededForDispute) public payable onlyGovernor {
        require(_percentageNeededForDispute <= 15, "Dispute % Needed can't be higher than 15");
        percentageNeededForDispute = _percentageNeededForDispute;
    }

    function changeMergeCreatorFeeShare(uint256 _mergeCreatorFeeShare) public payable onlyGovernor {
        require(_mergeCreatorFeeShare <= 20, "Merge Share can't be higher than 20");
        mergeCreatorFeeShare = _mergeCreatorFeeShare;
    }

    /// @dev returns true if NOW is less than bounty create time plus draft time
    function isBountyInDraft(uint256 id) public view returns (bool) {
        return block.timestamp < bounties[id].creationDate.add(draftTime);
    }

    /// @dev returns true if NOW is less than proposal create time plus disputable time
    function isProposalInDraft(uint256 bountyId, uint256 proposalId) public view returns (bool) {
        return block.timestamp < bounties[bountyId].proposals[proposalId].creationDate.add(disputableTime);
    }

    /// @dev returns true if disputes on proposal is higher than the percentage of the total oracles staked
    function isProposalDisputed(uint256 bountyId, uint256 proposalId) public view returns (bool) {
        return bounties[bountyId].proposals[proposalId].disputes >= oraclesStaked.mul(percentageNeededForDispute).div(100);
    }

    /// @dev get total amount of oracles of an address
    function getOraclesOf(address _address) public view returns (uint256) {
        Oracle storage oracle = oracles[_address];
        return oracle.oraclesDelegatedByOthers.add(oracle.oraclesDelegated[_address]);
    }

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
    function openBounty(uint256 tokenAmount, string memory cid, string memory title, string memory repoPath, string memory branch) external payable {
        bounties.push();
        Bounty storage bounty = bounties[bounties.length - 1];
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
        // bounties.push(bounty);

        require(transactionToken.transferFrom(msg.sender, address(this), tokenAmount), "Failed to transfer");

        emit BountyCreated(bounty.id, msg.sender, tokenAmount);
    }

    /// @dev cancel a bounty
    function cancelBounty(uint256 id) external payable {
        require(bounties.length <= id, "Bounty does not exist");

        Bounty storage bounty = bounties[id];

        require(bounty.creator == msg.sender, "Must be issue creator");
        require(isBountyInDraft(id), "Draft time has passed");
        require(bounty.closed != false, "Bounty must be open");
        require(bounty.canceled != false, "Bounty was already canceled");

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
    function createPullRequest(uint256 forBountyId, string memory originRepo, string memory originBranch, string memory originCID, string memory userRepo, string memory userBranch, uint256 cid) external payable {
        require(bounties.length <= forBountyId, "Bounty does not exist");

        Bounty storage bounty = bounties[forBountyId];
        require(bounty.closed != false, "Bounty is closed");
        require(bounty.canceled != false, "Bounty is canceled");

        PullRequest memory pullRequest;
        pullRequest.cid = cid;
        pullRequest.id = bounty.pullRequests.length;

        pullRequest.userBranch = userBranch;
        pullRequest.userRepo = userRepo;

        pullRequest.originBranch = originBranch;
        pullRequest.originRepo = originRepo;
        pullRequest.originCID = originCID;
        pullRequest.creator = msg.sender;

        bounty.pullRequests.push(pullRequest);

        emit BountyPullRequestCreated(forBountyId, pullRequest.id);
    }

    function cancelPullRequest(uint256 ofBounty, uint256 prId) external payable {
        require(bounties.length <= ofBounty, "Bounty does not exist");
        require(bounties[ofBounty].closed == false, "Bounty is already closed");
        require(bounties[ofBounty].canceled == false, "Bounty was canceled");

        require(bounties[ofBounty].pullRequests.length <= prId, "Pull request does not exist");
        require(bounties[ofBounty].pullRequests[prId].canceled != false, "Pull request was already canceled");
        require(bounties[ofBounty].pullRequests[prId].creator == msg.sender, "Canceling can only be made by its creator");

        for (uint256 i = 0; i <= bounties[ofBounty].proposals.length; i++) {
            require(bounties[ofBounty].proposals[i].prId != prId, "Pull request can't be canceled with a existing proposal");
        }

        PullRequest storage pullRequest = bounties[ofBounty].pullRequests[prId];
        pullRequest.canceled = true;

        emit BountyPullRequestCanceled(ofBounty, prId);
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
    function createBountyProposal(uint256 id, uint256 prId, address[] calldata recipients, uint256[] calldata percentages) external payable {
        require(bounties.length <= id, "Bounty does not exist");
        require(bounties[id].pullRequests.length <= prId, "Pull request does not exist");
        require(getOraclesOf(msg.sender) >= councilAmount, "Need to be council");

        Bounty storage bounty = bounties[id];
        PullRequest storage pullRequest = bounty.pullRequests[prId];

        bounty.proposals.push();
        Proposal storage proposal = bounty.proposals[bounty.proposals.length - 1];

        proposal.id = bounty.proposals.length;
        proposal.prId = prId;
        proposal.creationDate = block.timestamp;

        uint256 total = 0 + bounty.tokenAmount * mergeCreatorFeeShare / 100;

        for (uint i = 0; i < recipients.length; i++) {
            total = total.add(percentages[i] * (100 - mergeCreatorFeeShare) / 100);
            proposal.details.push();
            proposal.details[i].recipient = recipients[i];
            proposal.details[i].percentage = percentages[i];
        }

        require(total == 100, "Total should amount to 100%");

        bounty.proposals.push(proposal);

        emit BountyProposalCreated(id, prId, proposal.id);
    }

    /// @dev close bounty with the selected proposal id
    function closeBounty(uint256 id, uint256 proposalId) external payable {
        require(bounties.length <= id, "Bounty does not exist");
        require(bounties[id].proposals.length <= proposalId, "Proposal does not exist");

        Bounty storage bounty = bounties[id];
        require(!bounty.closed, "Bounty is already closed");
        require(!bounty.canceled, "Bounty was canceled");
        require(!isBountyInDraft(id), "Bounty is still in draft");

        Proposal storage proposal = bounty.proposals[proposalId];
        require(!isProposalInDraft(id, proposalId), "Proposal is still in draft");
        require(!isProposalDisputed(id, proposalId), "Proposal is disputed, cant accept");

        bounty.closed = true;

        uint256 fee = bounty.tokenAmount * mergeCreatorFeeShare / 100;
        require(transactionToken.transfer(msg.sender, fee), "Failed to transfer fee to merge creator");

        for (uint i = 0; i < proposal.details.length; i++) {
            ProposalDetail memory detail = proposal.details[i];
            require(transactionToken.transfer(detail.recipient, bounty.tokenAmount * (detail.percentage - fee) / 100), "Failed to transfer distribute to participant");
        }

        closedBounties = closedBounties.add(1);
        totalStaked = totalStaked.sub(bounty.tokenAmount);

        emit BountyDistributed(id, proposalId);

    }
}
