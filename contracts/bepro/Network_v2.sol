pragma solidity >=0.6.0 <=8.0.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../ERC20.sol";
import "../math/SafePercentMath.sol";
import "../utils/Governed.sol";
import "./BountyToken.sol";

contract Network_v2 is Governed, ReentrancyGuard {
    using SafeMath for uint256;

    constructor(
        address _settlerToken,
        address _transactionToken,
        string memory _bountyNftUri,
        string memory bountyNftName,
        string memory bountyNftSymbol
    ) Governed() ReentrancyGuard() {
        settlerToken = Token(_settlerToken);
        nftToken = new BountyToken(bountyNftName, bountyNftSymbol);
        bountyNftUri = _bountyNftUri;
    }

    Token public settlerToken;
    BountyToken public nftToken;

    string public bountyNftUri = "";

    uint256 public totalStaked = 0;

    uint256 public totalSettlerLocked = 0; // TVL essentially

    uint256 public oracleExchangeRate = 10000; // 10,000 = 1:1 ; parts per 10K
    uint256 public oraclesStaked = 0;
    uint256 public oraclesDistributed = 0; // essentially, the converted math of TVL

    uint256 public closedBounties = 0;

    uint256 public mergeCreatorFeeShare = 30000; // 3%; parts per 10,000
    uint256 public percentageNeededForDispute = 30000; // 3% parts per 10,000

    uint256 public disputableTime = 3 days;
    uint256 public draftTime = 1 days;
    uint256 public unlockPeriod = 183 days; // 6 months after closedDate

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

    struct Benefactor {
        address benefactor;
        uint256 amount;
        uint256 creationDate;
    }

    struct Bounty {
        uint256 id;
        uint256 creationDate;
        uint256 tokenAmount;

        address creator;
        address transactional;
        address rewardToken;
        uint256 rewardAmount;
        uint256 fundingAmount;
        uint256 settlerTokenRatio;

        bool closed;
        bool canceled;
        bool funded;

        string title;
        string repoPath;
        string branch;
        string cid;

        uint256 closedDate;

        PullRequest[] pullRequests;
        Proposal[] proposals;
        Benefactor[] benefactors;
        Benefactor[] funding;
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

    modifier bountyExists(uint256 id) {
        require(bounties.length <= id, "Bounty does not exists");
        _;
    }

    modifier isBountyOwner(uint256 id) {
        require(bounties[id].creator == msg.sender, "User must be owner of bounty");
        _;
    }

    modifier isFundingRequest(uint256 id) {
        require(isBountyFundingRequest(id) == true, "Bounty is not a funding request");
        _;
    }

    modifier isNotFundingRequest(uint256 id) {
        require(isBountyFundingRequest(id) == false, "Bounty can't be a funding request");
        _;
    }

    modifier isNotInDraft(uint256 id) {
        require(isBountyInDraft(id) == false, "Bounty must NOT be in draft time");
        _;
    }

    modifier isInDraft(uint256 id) {
        require(isBountyInDraft(id) == true, "Bounty must be in draft time");
        _;
    }

    modifier isNotCanceled(uint256 id) {
        require(getBounty(id).canceled == false, "Bounty can't canceled");
        _;
    }

    modifier isOpen(uint256 id) {
        require(getBounty(id).closed == false, "Bounty must be open");
        _;
    }

    modifier isClosed(uint256 id) {
        require(getBounty(id).closed == true, "Bounty must be closed");
        _;
    }

    modifier isCouncilMember() {
        require(getOraclesOf(msg.sender) >= councilAmount, "Need to be council");
        _;
    }

    function getBountiesOfAddress(address _address) public view returns (uint256[] memory) {
        return bountiesOfAddress[_address];
    }

    function getBounty(uint256 id) public bountyExists(id) view returns (Bounty memory bounty) {
        return bounties[id];
    }

    function getBounties(uint256[] calldata ids) public view returns (Bounty[] memory _bounties) {
        require(ids.length > 0, "Length can't be empty empty");
        require(ids.length < bounties.length, "Length can't higher than bounties");

        Bounty[] memory data = new Bounty[](ids.length);
        for (uint256 i = 0; i <= ids.length - 1; i--) {
            data[i] = getBounty(ids[i]);
        }

        return data;
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
        require(councilAmount >= 100000 * 10 ** settlerToken.decimals(), "Council Amount has to higher than 100k");
        require(councilAmount <= 50000000 * 10 ** settlerToken.decimals(), "Council Amount has to lower than 50M");
        councilAmount = newAmount;
    }

    function changeDraftTime(uint256 _draftTime) public payable onlyGovernor {
        require(_draftTime <= 20 days, "Time has to be lower than 20 days");
        require(_draftTime >= 1 minutes, "Time has to be higher than 1 minutes");
        draftTime = _draftTime;
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

    function changeOracleExchangeRate(uint256 _oracleExchangeRate) public payable onlyGovernor {
        require(_oracleExchangeRate >= 0, "Cant be less than 0");
        oracleExchangeRate = _oracleExchangeRate;
    }

    /// @dev returns true if NOW is less than bounty create time plus draft time
    function isBountyInDraft(uint256 id) public view returns (bool) {
        return block.timestamp < getBounty(id).creationDate.add(draftTime);
    }

    function isBountyFundingRequest(uint256 id) public view returns (bool) {
        Bounty memory bounty = getBounty(id);
        return bounty.rewardToken != address(0);
    }

    function isBountyFunded(uint256 id) public view returns (bool) {
        require(isBountyFundingRequest(id), "Bounty is not a funding request");
        return getBounty(id).funded == true;
    }

    /// @dev returns true if NOW is less than proposal create time plus disputable time
    function isProposalInDraft(uint256 bountyId, uint256 proposalId) public view returns (bool) {
        return block.timestamp < bounties[bountyId].proposals[proposalId].creationDate.add(disputableTime);
    }

    /// @dev returns true if disputes on proposal is higher than the percentage of the total oracles staked
    function isProposalDisputed(uint256 bountyId, uint256 proposalId) public view returns (bool) {
        return bounties[bountyId].proposals[proposalId].disputes >= oraclesStaked.mul(percentageNeededForDispute).div(100);
    }

    function isAfterUnlockPeriod(uint256 date) public view returns (bool) {
        return date.add(unlockPeriod) > block.timestamp;
    }

    /// @dev get total amount of oracles of an address
    function getOraclesOf(address _address) public view returns (uint256) {
        Oracle storage oracle = oracles[_address];
        return oracle.oraclesDelegatedByOthers.add(oracle.oraclesDelegated[_address]);
    }

    function getOracleExchangeRate() public view returns (uint256) {
        return oracleExchangeRate;
    }

    function calculatePercentPerTenK(uint256 amount) public view returns (uint256) {
        return amount.div(10000);
    }

    function calculateOracleExchangeRate(uint256 settlerAmount) public view returns (uint256) {
        return settlerAmount.mul(calculatePercentPerTenK(oracleExchangeRate));
    }

    function calculateSettlerExchangeRate(uint256 oraclesAmount) public view returns (uint256) {
        return oraclesAmount.div(calculatePercentPerTenK(oracleExchangeRate));
    }

    /// @dev Lock given amount into the oracle mapping
    function lock(uint256 tokenAmount) external payable {
        require(tokenAmount > 0, "Token amount has to be higher than 0");
        require(settlerToken.transferFrom(msg.sender, address(this), tokenAmount));

        Oracle storage oracle = oracles[msg.sender];

        uint256 exchangedAmount = calculateOracleExchangeRate(tokenAmount);

        oracle.oraclesDelegated[msg.sender] = oracle.oraclesDelegated[msg.sender].add(exchangedAmount);
        oracle.tokensLocked = oracle.tokensLocked.add(exchangedAmount);

//        if (oracle.tokensLocked != 0) {
//            oracle.oraclesDelegated[msg.sender] = oracle.oraclesDelegated[msg.sender].add(exchangedAmount);
//            oracle.tokensLocked = oracle.tokensLocked.add(exchangedAmount);
//        } else {
//            oracle.oraclesDelegated[msg.sender] = exchangedAmount;
//            oracle.tokensLocked = exchangedAmount;
//        }

        totalSettlerLocked = totalSettlerLocked.add(tokenAmount);
        oraclesDistributed = oraclesDistributed.add(exchangedAmount);
    }

    /// @dev Unlock from the oracle mapping
    function unlock(uint256 tokenAmount, address from) external payable {
        Oracle storage oracle = oracles[msg.sender];

        uint256 exchangedAmount = calculateSettlerExchangeRate(tokenAmount);

        require(oracle.tokensLocked >= exchangedAmount, "tokenAmount is higher than the amount of locked tokens");
        require(oracle.oraclesDelegated[from] >= exchangedAmount, "tokenAmount is higher than the amount of delegated tokens to from address");

        oracle.tokensLocked = oracle.tokensLocked.sub(exchangedAmount);
        oracle.oraclesDelegated[from] = oracle.oraclesDelegated[from].sub(exchangedAmount);

        if (msg.sender != from) {
            oracles[from].oraclesDelegatedByOthers = oracles[from].oraclesDelegatedByOthers.sub(exchangedAmount);
        }

        oraclesDistributed = oraclesDistributed.sub(tokenAmount);
        totalSettlerLocked = totalSettlerLocked.sub(exchangedAmount);

        require(settlerToken.transfer(msg.sender, exchangedAmount), "settlerToken failed to be transferred");
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
    function openBounty(
        uint256 tokenAmount,
        address transactional,
        address rewardToken,
        uint256 rewardAmount,
        uint256 settlerTokenRatio,
        uint256 fundingAmount,
        string memory cid,
        string memory title,
        string memory repoPath,
        string memory branch
    ) external payable {
        bounties.push();
        Bounty storage bounty = bounties[bounties.length - 1];
        bounty.cid = cid;
        bounty.title = title;
        bounty.repoPath = repoPath;
        bounty.branch = branch;
        bounty.creator = msg.sender;
        bounty.id = bounties.length - 1;
        bounty.creationDate = block.timestamp;

        bounty.transactional = transactional;

        bounty.closed = false;
        bounty.canceled = false;

        if (address(0) != rewardToken) {
            require(tokenAmount == 0, "tokenAmount has to be 0 when requesting funding");
            require(rewardAmount > 0, "Reward amount has to be higher than 0");
            require(fundingAmount > 0, "Funding request amount has to be higher than 0");
            ERC20 erc20 = ERC20(rewardToken);
            require(erc20.transferFrom(msg.sender, address(this), rewardAmount));

            bounty.rewardAmount = rewardAmount;
            bounty.rewardToken = rewardToken;
            bounty.fundingAmount = fundingAmount;
            bounty.tokenAmount = 0;
            bounty.settlerTokenRatio = settlerTokenRatio;
        } else {
            bounty.tokenAmount = tokenAmount;
            ERC20 erc20 = ERC20(transactional);
            require(erc20.transferFrom(msg.sender, address(this), tokenAmount), "Failed to transfer");
        }

        cidBountyId[cid] = bounty.id;
        bountiesOfAddress[msg.sender].push(bounty.id);

        emit BountyCreated(bounty.id, msg.sender, tokenAmount);
    }

    /// @dev user adds value to an existing bounty
    function supportBounty(
        uint256 id,
        uint256 tokenAmount
    ) external bountyExists(id) isBountyOwner(id) isInDraft(id) isNotFundingRequest(id) payable {
        Bounty storage bounty = bounties[id];

        bounty.benefactors.push(Benefactor(msg.sender, tokenAmount, block.timestamp));

        ERC20 erc20 = ERC20(bounty.transactional);

        require(erc20.transferFrom(msg.sender, address(this), tokenAmount), "Failed to transfer");
        bounty.tokenAmount = bounty.tokenAmount.add(tokenAmount);
    }

    /// @dev user removes its beneficiary entry
    function retractSupportFromBounty(
        uint256 bountyId,
        uint256 entryId
    ) external bountyExists(bountyId) isInDraft(bountyId) isNotFundingRequest(bountyId) payable {
        Bounty storage bounty = bounties[bountyId];
        ERC20 erc20 = ERC20(bounty.transactional);

        require(bounty.benefactors[entryId].amount > 0, "Entry was already retracted");
        require(bounty.benefactors[entryId].benefactor == msg.sender, "You must be the beneficiary");
        require(erc20.transferFrom(address(this), msg.sender, bounty.benefactors[entryId].amount));

        bounty.benefactors[entryId].amount = 0;
        bounty.tokenAmount = bounty.tokenAmount.sub(bounty.benefactors[entryId].amount);
    }

    /// @dev cancel a bounty
    function cancelBounty(
        uint256 id
    ) external bountyExists(id) isBountyOwner(id) isInDraft(id) isNotCanceled(id) isNotFundingRequest(id) payable {

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        bounty.canceled = true;

        uint256 tokenAmount = bounty.tokenAmount;

        if (bounty.benefactors.length > 0) {
            Benefactor[] memory benefactors = bounty.benefactors;
            for (uint256 i = 0; i <= benefactors.length - 1; i++) {
                if (benefactors[i].amount > 0) {
                    require(erc20.transfer(benefactors[i].benefactor, benefactors[i].amount), "Failed to transfer amount to benefactor");
                    tokenAmount = tokenAmount.sub(benefactors[i].amount);
                }
            }
        }

        require(erc20.transfer(bounty.creator, tokenAmount), "Failed to transfer token amount to creator");

        emit BountyCanceled(id);
    }

    /// @dev cancel funding
    function cancelFundRequest(
        uint256 id
    ) external bountyExists(id) isBountyOwner(id) isInDraft(id) isNotCanceled(id) isFundingRequest(id) payable {

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        for (uint256 i = 0; i >= bounty.funding.length - 1; i++) {
            Benefactor storage x = bounty.funding[i];
            if (x.amount > 0) {
                uint256 settlerAmount = x.amount * calculatePercentPerTenK(bounty.settlerTokenRatio);
                require(settlerToken.transfer(msg.sender, settlerAmount), "Failed to transfer settler amount to funder");
                require(erc20.transfer(x.benefactor, x.amount), "Failed to transfer amount to funder");
                totalSettlerLocked = totalSettlerLocked.sub(settlerAmount);
                x.amount = 0;
            }
        }

        bounty.canceled = true;

        ERC20 rewardToken = ERC20(bounty.rewardToken);
        require(rewardToken.transfer(msg.sender, bounty.rewardAmount), "Failed to transfer rewardToken to funding requester");
    }

    /// @dev update the value of a bounty with a new amount
    function updateBountyAmount(
        uint256 id,
        uint256 newTokenAmount
    ) external bountyExists(id) isBountyOwner(id) isInDraft(id) isNotFundingRequest(id) payable {

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        require(bounty.tokenAmount != newTokenAmount, "Cant be same amount");

        uint256 previousAmount = bounty.tokenAmount;
        uint256 retrieveAmount = 0;

        if (newTokenAmount > previousAmount) {
            retrieveAmount = newTokenAmount.sub(previousAmount);
        } else {
            retrieveAmount = previousAmount.sub(newTokenAmount);
        }

        require(erc20.transfer(bounty.creator, retrieveAmount), "Failed to transfer token amount to creator");
        bounty.tokenAmount = newTokenAmount;
    }

    /// @dev enable users to fund a bounty
    function fundBounty(
        uint256 id,
        uint256 fundingAmount
    ) external bountyExists(id) isFundingRequest(id) isInDraft(id) payable {

        Bounty storage bounty = bounties[id];
        require(bounty.funded == false, "Bounty was already funded");
        require(bounty.fundingAmount <= fundingAmount, "Amount is higher than the requested funding amount");
        require(bounty.tokenAmount.add(fundingAmount) <= bounty.tokenAmount, "Amount would surpass the requested funding amount");

        bounty.funding.push(Benefactor(msg.sender, fundingAmount, block.timestamp));

        bounty.tokenAmount = bounty.tokenAmount.add(fundingAmount);
        bounty.funded = bounty.fundingAmount == bounty.tokenAmount;

        ERC20 erc20 = ERC20(bounty.transactional);
        uint256 settlerAmount = fundingAmount * calculatePercentPerTenK(bounty.settlerTokenRatio);
        require(erc20.transferFrom(msg.sender, address(this), fundingAmount), "Failed to transfer funding");
        require(settlerToken.transferFrom(msg.sender, address(this), settlerAmount), "Failed to transfer settler funding");

        totalSettlerLocked = totalSettlerLocked.add(settlerAmount);
    }

    /// @dev enable users to retract their funding
    function retractFunds(
        uint256 id,
        uint256[] calldata fundingIds
    ) external bountyExists(id) isInDraft(id) payable {

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        for (uint256 i = fundingIds.length; i >= 0; i--) {
            Benefactor storage x = bounty.benefactors[fundingIds[i]];
            require(x.benefactor == msg.sender, "Some of the chosen funding Ids were not yours");
            require(x.amount > 0, "Some of the chosen funding Ids were already retracted");
            require(erc20.transfer(msg.sender, x.amount), "Failed to retract funding");
            uint256 settlerAmount = x.amount * calculatePercentPerTenK(bounty.settlerTokenRatio);
            require(settlerToken.transfer(msg.sender, settlerAmount), "Failed to retract settler funding");
            totalSettlerLocked = totalSettlerLocked.sub(settlerAmount);
            bounty.tokenAmount = bounty.tokenAmount.sub(x.amount);
            x.amount = 0;
        }

        bounty.funded = bounty.tokenAmount == bounty.fundingAmount;
    }

    /// @dev create pull request for bounty id
    function createPullRequest(
        uint256 forBountyId,
        string memory originRepo,
        string memory originBranch,
        string memory originCID,
        string memory userRepo,
        string memory userBranch,
        uint256 cid
    ) external bountyExists(forBountyId) isOpen(forBountyId) isNotCanceled(forBountyId) payable {


        Bounty storage bounty = bounties[forBountyId];

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

    function cancelPullRequest(
        uint256 ofBounty,
        uint256 prId
    ) external bountyExists(ofBounty) isOpen(ofBounty) isNotCanceled(ofBounty) payable {

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
    function markPullRequestReadyForReview(
        uint256 bountyId,
        uint256 pullRequestId
    ) external bountyExists(bountyId) isNotInDraft(bountyId) isNotCanceled(bountyId) isOpen(bountyId) payable {

        require(bounties[bountyId].pullRequests.length <= pullRequestId, "Pull request does not exist");
        require(bounties[bountyId].pullRequests[pullRequestId].ready == false, "Pull request already marked as ready");

        bounties[bountyId].pullRequests[pullRequestId].ready = true;

        emit BountyPullRequestReadyForReview(bountyId, pullRequestId);
    }

    /// @dev create a proposal with a pull request for a bounty
    function createBountyProposal(
        uint256 id,
        uint256 prId,
        address[] calldata recipients,
        uint256[] calldata percentages
    ) external bountyExists(id) isNotInDraft(id) isOpen(id) isNotCanceled(id) isCouncilMember() payable {
        require(getBounty(id).pullRequests.length <= prId, "Pull request does not exist");

        Bounty storage bounty = bounties[id];
        PullRequest storage pullRequest = bounty.pullRequests[prId];

        bounty.proposals.push();
        Proposal storage proposal = bounty.proposals[bounty.proposals.length - 1];

        proposal.id = bounty.proposals.length;
        proposal.prId = prId;
        proposal.creationDate = block.timestamp;

        uint256 total = 0 + bounty.tokenAmount.mul(calculatePercentPerTenK(mergeCreatorFeeShare));

        for (uint i = 0; i < recipients.length; i++) {
            total = total.add(percentages[i].mul(100 - calculatePercentPerTenK(mergeCreatorFeeShare)).div(100));
            proposal.details.push();
            proposal.details[i].recipient = recipients[i];
            proposal.details[i].percentage = percentages[i];
        }

        require(total == 100, "Total should amount to 100%");

        bounty.proposals.push(proposal);

        emit BountyProposalCreated(id, prId, proposal.id);
    }

    /// @dev close bounty with the selected proposal id
    function closeBounty(
        uint256 id,
        uint256 proposalId
    ) external bountyExists(id) isOpen(id) isNotCanceled(id) isNotInDraft(id) payable {
        require(bounties[id].proposals.length <= proposalId, "Proposal does not exist");

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        Proposal storage proposal = bounty.proposals[proposalId];
        require(isProposalInDraft(id, proposalId) == false, "Proposal is still in draft");
        require(isProposalDisputed(id, proposalId) == false, "Proposal is disputed, cant accept");

        bounty.closed = true;
        bounty.closedDate = block.timestamp;

        uint256 mergerFee = bounty.tokenAmount.mul(calculatePercentPerTenK(mergeCreatorFeeShare));

        uint256 proposalAmount = bounty.tokenAmount.sub(mergerFee);
        require(erc20.transfer(msg.sender, mergerFee), "Failed to transfer fee to merge creator");

        for (uint256 i = 0; i < proposal.details.length; i++) {
            ProposalDetail memory detail = proposal.details[i];
            require(erc20.transfer(detail.recipient, proposalAmount.mul(detail.percentage.div(100))), "Failed to transfer distribute to participant");
            nftToken.awardBounty(detail.recipient, bountyNftUri, bounty.id, detail.percentage);
        }

        if (isBountyFundingRequest(id) == true) {
            ERC20 rewardToken = ERC20(bounty.rewardToken);
            for (uint256 i = 0; i < bounty.funding.length; i++) {
                Benefactor storage x = bounty.funding[i];
                if (x.amount > 0) {
                    uint256 rewardAmount = (x.amount / bounty.fundingAmount) * bounty.rewardAmount;
                    require(rewardToken.transfer(x.benefactor, rewardAmount), "Failed to transfer reward token amount");
                    x.amount = 0;
                }
            }
        }

        closedBounties = closedBounties.add(1);

        emit BountyDistributed(id, proposalId);
    }

    /// @dev unlocks ALL settlerTokens back to the benefactors
    function unlockFundingSettler(
        uint256 id
    ) external bountyExists(id) isNotInDraft(id) isClosed(id) isNotCanceled(id) isFundingRequest(id) payable {
        Bounty storage bounty = bounties[id];

        require(bounty.closed == true, "Bounty has to have been closed");
        require(isAfterUnlockPeriod(bounty.closedDate) == true, "Unlock period has yet to be reached");

        for (uint256 i = 0; i < bounty.funding.length; i++) {
            Benefactor storage x = bounty.funding[i];
            require(settlerToken.transfer(x.benefactor, x.amount), "Failed to unlock settler funds");
            totalSettlerLocked = totalSettlerLocked.sub(x.amount);
            x.amount = 0;
        }
    }
}
