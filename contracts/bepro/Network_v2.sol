pragma solidity >=0.6.0 <=8.0.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "../math/SafePercentMath.sol";
import "../utils/Governed.sol";
import "./BountyToken.sol";

contract Network_v2 is Governed, ReentrancyGuard {
    using SafeMath for uint256;

    constructor(
        address _settlerToken,
        address _nftTokenAddress,
        string memory _bountyNftUri
    ) Governed() ReentrancyGuard() {
        settlerToken = ERC20(_settlerToken);
        nftToken = BountyToken(_nftTokenAddress);
        bountyNftUri = _bountyNftUri;
    }

    ERC20 public settlerToken;
    BountyToken public nftToken;

    string public bountyNftUri = "";

    uint256 public totalSettlerLocked = 0; // TVL essentially

    uint256 public oracleExchangeRate = 10000; // 10,000 = 1:1 ; parts per 10K
    uint256 public oraclesStaked = 0;
    uint256 public oraclesDistributed = 0; // essentially, the converted math of TVL

    uint256 public closedBounties = 0;
    uint256 public canceledBounties = 0;

    uint256 public mergeCreatorFeeShare = 30000; // 3%; parts per 10,000
    uint256 public proposerFeeShare = 30000; // 3%; parts per 10,000
    uint256 public percentageNeededForDispute = 30000; // 3% parts per 10,000

    uint256 public disputableTime = 3 days;
    uint256 public draftTime = 1 days;
    uint256 public unlockPeriod = 183 days; // 6 months after closedDate

    uint256 public councilAmount = 25000000*10**18; // 25M * 10 to the power of 18 (decimals)

    address feeReceiver = address(0); // address of people who will receive fees in case of doing network by other ppl
    uint256 closeFee = 50000; // in bounty transactional
    uint256 cancelFee = 10000; // in bounty transactional
    // todo account with these values

    struct Oracle {
        uint256 oraclesDelegatedByOthers;
        uint256 tokensLocked;

        mapping(address => uint256) oraclesDelegated;
        mapping(uint256 => mapping(uint256 => uint256)) disputes;
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
        uint256 disputeWeight;
        uint256 prId;
        bool refusedByBountyOwner;
        address creator;
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
        address transactional; // 1,000 -> dev, merge creater, distribution proposer
        address rewardToken; // DOGE
        uint256 rewardAmount; // 2000
        uint256 fundingAmount; // 1,000
        // uint256 settlerTokenRatio; // 0.2

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

    event BountyCreated(uint256 id, string cid, address indexed creator);
    event BountyCanceled(uint256 indexed id);
    event BountyDistributed(uint256 indexed id, uint256 proposalId);
    event BountyPullRequestCreated(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyPullRequestReadyForReview(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyPullRequestCanceled(uint256 indexed bountyId, uint256 pullRequestId);
    event BountyProposalCreated(uint256 indexed bountyId, uint256 prId, uint256 proposalId);
    event BountyProposalDisputed(uint256 indexed bountyId, uint256 prId, uint256 proposalId);
    event BountyProposalRefused(uint256 indexed bountyId, uint256 prId, uint256 proposalId);

    function _bountyExists(uint256 id) internal view {
        require((bounties.length - 1) <= id, "B0");
    }

    function _isBountyOwner(uint256 id) internal view {
        require(bounties[id].creator == msg.sender, "OW1");
    }

    function _isFundingRequest(uint256 id) internal view {
        require(bounties[id].rewardToken != address(0), "BF1");
    }

    function _isNotFundingRequest(uint256 id) internal view {
        require(bounties[id].rewardToken == address(0), "BF0");
    }

    function _isNotDraft(uint256 id) internal view {
        require(isBountyInDraft(id) == false, "BDT0");
    }

    function _isInDraft(uint256 id) internal view {
        require(isBountyInDraft(id) == true, "BDT1");
    }

    function _isNotCanceled(uint256 id) internal view {
        require(bounties[id].canceled == false, "B1");
    }

    function _isOpen(uint256 id) internal view {
        require(bounties[id].closed == false, "B3");
    }

    modifier bountyExists(uint256 id) {
        _bountyExists(id);
        _;
    }

    modifier isBountyOwner(uint256 id) {
        _isBountyOwner(id);
        _;
    }

    modifier isFundingRequest(uint256 id) {
        _isFundingRequest(id);
        _;
    }

    modifier isNotFundingRequest(uint256 id) {
        _isNotFundingRequest(id);
        _;
    }

    modifier isNotInDraft(uint256 id) {
        _isNotDraft(id);
        _;
    }

    modifier isInDraft(uint256 id) {
        _isInDraft(id);
        _;
    }

    modifier isNotCanceled(uint256 id) {
        _isNotCanceled(id);
        _;
    }

    modifier isOpen(uint256 id) {
        _isOpen(id);
        _;
    }

    function getBounty(uint256 id) public view returns (Bounty memory) {
        return bounties[id];
    }

    function getBountiesOfAddress(address _address) public view returns (uint256[] memory) {
        return bountiesOfAddress[_address];
    }

    function bountiesTotal() public view returns (uint256) {
        return bounties.length;
    }

    function getPullRequest(uint256 bountyId, uint256 pullRequestId) public view returns (PullRequest memory) {
        require(bounties[bountyId].pullRequests.length <= pullRequestId, "PR0");
        return bounties[bountyId].pullRequests[pullRequestId];
    }

    function getProposal(uint256 bountyId, uint256 proposalId) public view returns (Proposal memory) {
        require(bounties[bountyId].proposals.length <= proposalId, "P0");
        return bounties[bountyId].proposals[proposalId];
    }

    function changeCouncilAmount(uint256 newAmount) public payable onlyGovernor {
        require(councilAmount >= 100000 * 10 ** settlerToken.decimals(), "C1");
        require(councilAmount <= 50000000 * 10 ** settlerToken.decimals(), "C2");
        councilAmount = newAmount;
    }

    function lessThan20MoreThan1(uint256 value) internal {
        require(value <= 20 days, "T1");
        require(value >= 1 minutes, "T2");
    }

    function changeDraftTime(uint256 _draftTime) public payable onlyGovernor {
        lessThan20MoreThan1(_draftTime);
        draftTime = _draftTime;
    }

    function changeDisputableTime(uint256 _disputableTime) public payable onlyGovernor {
        lessThan20MoreThan1(_disputableTime);
        disputableTime = _disputableTime;
    }

    function changePercentageNeededForDispute(uint256 _percentageNeededForDispute) public payable onlyGovernor {
        require(_percentageNeededForDispute <= 10000, "D1");
        percentageNeededForDispute = _percentageNeededForDispute;
    }

    function changeMergeCreatorFeeShare(uint256 _mergeCreatorFeeShare) public payable onlyGovernor {
        require(calculatePercentPerTenK(_mergeCreatorFeeShare) <= 10, "M1");
        mergeCreatorFeeShare = _mergeCreatorFeeShare;
    }

    function changeOracleExchangeRate(uint256 _oracleExchangeRate) public payable onlyGovernor {
        require(_oracleExchangeRate >= 0, "EX0");
        oracleExchangeRate = _oracleExchangeRate;
    }

    /// @dev returns true if NOW is less than bounty create time plus draft time
    function isBountyInDraft(uint256 id) public view returns (bool) {
        return block.timestamp < bounties[id].creationDate.add(draftTime);
    }

    function isBountyFunded(uint256 id) public view returns (bool) {
        return bounties[id].funded == true;
    }

    /// @dev returns true if NOW is less than proposal create time plus disputable time
    function isProposalInDraft(uint256 bountyId, uint256 proposalId) public view returns (bool) {
        return block.timestamp < bounties[bountyId].proposals[proposalId].creationDate.add(disputableTime);
    }

    /// @dev returns true if disputeWeight on proposal is higher than the percentage of the total oracles staked
    function isProposalDisputed(uint256 bountyId, uint256 proposalId) public view returns (bool) {
        return bounties[bountyId].proposals[proposalId].disputeWeight >= oraclesStaked.mul(percentageNeededForDispute).div(10000);
    }

    function isProposalRefused(uint256 bountyId, uint256 proposalId) public view returns (bool) {
        return bounties[bountyId].proposals[proposalId].refusedByBountyOwner;
    }

    function isAfterUnlockPeriod(uint256 date) public view returns (bool) {
        return date.add(unlockPeriod) > block.timestamp;
    }

    /// @dev get total amount of oracles of an address
    function getOraclesOf(address _address) public view returns (uint256) {
        return oracles[_address].oraclesDelegatedByOthers.add(oracles[_address].oraclesDelegated[_address]);
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
    function lock(uint256 tokenAmount) public payable {
        require(tokenAmount > 0, "L0");
        require(settlerToken.transferFrom(msg.sender, address(this), tokenAmount));

        Oracle storage oracle = oracles[msg.sender];

        uint256 exchangedAmount = calculateOracleExchangeRate(tokenAmount);

        oracle.oraclesDelegated[msg.sender] = oracle.oraclesDelegated[msg.sender].add(exchangedAmount);
        oracle.tokensLocked = oracle.tokensLocked.add(exchangedAmount);

        totalSettlerLocked = totalSettlerLocked.add(tokenAmount);
        oraclesDistributed = oraclesDistributed.add(exchangedAmount);
    }

    /// @dev Unlock from the oracle mapping
    function unlock(uint256 tokenAmount, address from) public payable {
        Oracle storage oracle = oracles[msg.sender];


        if (msg.sender != from) {
            require(oracle.tokensLocked >= tokenAmount, "UL1");
            oracle.oraclesDelegated[msg.sender] = oracle.oraclesDelegated[msg.sender].add(tokenAmount);
            oracle.oraclesDelegated[from] = oracle.oraclesDelegated[from].sub(tokenAmount);
            oracles[from].oraclesDelegatedByOthers = oracles[from].oraclesDelegatedByOthers.sub(tokenAmount);
        } else {
            uint256 exchangedAmount = calculateSettlerExchangeRate(tokenAmount);

            require(oracle.tokensLocked >= tokenAmount, "UL2");

            oracle.oraclesDelegated[msg.sender] = oracle.oraclesDelegated[msg.sender].sub(tokenAmount);
            oracle.tokensLocked = oracle.tokensLocked.sub(tokenAmount);

            totalSettlerLocked = totalSettlerLocked.sub(exchangedAmount);
            oraclesDistributed = oraclesDistributed.sub(tokenAmount);

            require(settlerToken.transfer(msg.sender, exchangedAmount), "UL3");
        }
    }

    /// @dev Gives oracles from msg.sender to recipient
    function delegateOracles(uint256 tokenAmount, address recipient) public payable {
        require(recipient != address(0), "D1");
        require(recipient != msg.sender, "D2");

        Oracle storage oracle = oracles[msg.sender];

        require(oracle.tokensLocked >= tokenAmount, "D3");
        require(oracle.oraclesDelegated[msg.sender] >= tokenAmount, "D4");

        oracle.oraclesDelegated[msg.sender] = oracle.oraclesDelegated[msg.sender].sub(tokenAmount);
        oracle.oraclesDelegated[recipient] = oracle.oraclesDelegated[recipient].add(tokenAmount);
        oracles[recipient].oraclesDelegatedByOthers = oracles[recipient].oraclesDelegatedByOthers.add(tokenAmount);
    }

    /// @dev create a bounty
    function openBounty(
        uint256 tokenAmount,
        address transactional,
        address rewardToken,
        uint256 rewardAmount,
        uint256 fundingAmount,
        string memory cid,
        string memory title,
        string memory repoPath,
        string memory branch
    ) public payable {
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
            require(tokenAmount == 0, "O1");
            require(rewardAmount > 0, "O2");
            require(fundingAmount > 0, "O3");
            ERC20 erc20 = ERC20(rewardToken);
            require(erc20.transferFrom(msg.sender, address(this), rewardAmount));

            bounty.rewardAmount = rewardAmount;
            bounty.rewardToken = rewardToken;
            bounty.fundingAmount = fundingAmount;
            bounty.tokenAmount = 0;
            // bounty.settlerTokenRatio = settlerTokenRatio;
        } else {
            bounty.tokenAmount = tokenAmount;
            ERC20 erc20 = ERC20(transactional);
            require(erc20.transferFrom(msg.sender, address(this), tokenAmount), "O4");
        }

        cidBountyId[cid] = bounty.id;
        bountiesOfAddress[msg.sender].push(bounty.id);

        emit BountyCreated(bounty.id, bounty.cid, bounty.creator);
    }

    /// @dev user adds value to an existing bounty
    function supportBounty(
        uint256 id,
        uint256 tokenAmount
    ) bountyExists(id) isInDraft(id) isNotFundingRequest(id) public payable {
        Bounty storage bounty = bounties[id];
        require(bounty.creator != msg.sender, "S0");

        bounty.benefactors.push(Benefactor(msg.sender, tokenAmount, block.timestamp));

        ERC20 erc20 = ERC20(bounty.transactional);

        require(erc20.transferFrom(msg.sender, address(this), tokenAmount), "S1");
        bounty.tokenAmount = bounty.tokenAmount.add(tokenAmount);
    }

    /// @dev user removes its beneficiary entry
    function retractSupportFromBounty(
        uint256 bountyId,
        uint256 entryId
    ) bountyExists(bountyId) isInDraft(bountyId) isNotFundingRequest(bountyId) public payable {
        Bounty storage bounty = bounties[bountyId];
        ERC20 erc20 = ERC20(bounty.transactional);

        require(bounty.benefactors[entryId].amount > 0, "R1");
        require(bounty.benefactors[entryId].benefactor == msg.sender, "R2");
        require(erc20.transfer(msg.sender, bounty.benefactors[entryId].amount), "R3");

        bounty.tokenAmount = bounty.tokenAmount.sub(bounty.benefactors[entryId].amount);
        bounty.benefactors[entryId].amount = 0;
    }

    /// @dev cancel a bounty
    function cancelBounty(
        uint256 id
    ) bountyExists(id) isBountyOwner(id) isInDraft(id) isNotCanceled(id) isNotFundingRequest(id) public payable {

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        bounty.canceled = true;

        if (bounty.benefactors.length > 0) {
            Benefactor[] memory benefactors = bounty.benefactors;
            for (uint256 i = 0; i <= benefactors.length - 1; i++) {
                if (benefactors[i].amount > 0) {
                    require(erc20.transfer(benefactors[i].benefactor, benefactors[i].amount), "C1");
                    bounty.tokenAmount = bounty.tokenAmount.sub(benefactors[i].amount);
                }
            }
        }

        require(erc20.transfer(bounty.creator, bounty.tokenAmount), "C2");

        canceledBounties = canceledBounties.add(1);

        emit BountyCanceled(id);
    }

    /// @dev cancel funding
    function cancelFundRequest(
        uint256 id
    ) bountyExists(id) isBountyOwner(id) isInDraft(id) isNotCanceled(id) isFundingRequest(id) public payable {

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        for (uint256 i = 0; i >= bounty.funding.length - 1; i++) {
            Benefactor storage x = bounty.funding[i];
            if (x.amount > 0) {
                require(erc20.transfer(x.benefactor, x.amount), "C4");
                x.amount = 0;
            }
        }

        bounty.canceled = true;

        ERC20 rewardToken = ERC20(bounty.rewardToken);
        require(rewardToken.transfer(msg.sender, bounty.rewardAmount), "C5");
    }

    /// @dev update the value of a bounty with a new amount
    function updateBountyAmount(
        uint256 id,
        uint256 newTokenAmount
    ) bountyExists(id) isBountyOwner(id) isInDraft(id) isNotFundingRequest(id) public payable {

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        require(bounty.tokenAmount != newTokenAmount, "U1");

        if (newTokenAmount > bounty.tokenAmount) {
            uint256 giveAmount = newTokenAmount.sub(bounty.tokenAmount);
            require(erc20.transferFrom(msg.sender, address(this), giveAmount), "U2");
        } else {
            uint256 retrieveAmount = bounty.tokenAmount.sub(newTokenAmount);
            require(erc20.transfer(bounty.creator, retrieveAmount), "U3");
        }

        bounty.tokenAmount = newTokenAmount;
    }

    /// @dev enable users to fund a bounty
    function fundBounty(
        uint256 id,
        uint256 fundingAmount
    ) bountyExists(id) isFundingRequest(id) isInDraft(id) public payable {

        Bounty storage bounty = bounties[id];
        require(bounty.funded == false, "F1");
        require(bounty.tokenAmount < bounty.fundingAmount, "F2");
        require(bounty.tokenAmount.add(fundingAmount) <= bounty.tokenAmount, "F3");

        bounty.funding.push(Benefactor(msg.sender, fundingAmount, block.timestamp));

        bounty.tokenAmount = bounty.tokenAmount.add(fundingAmount);
        bounty.funded = bounty.fundingAmount == bounty.tokenAmount;

        ERC20 erc20 = ERC20(bounty.transactional);
        // uint256 settlerAmount = fundingAmount * calculatePercentPerTenK(bounty.settlerTokenRatio);
        require(erc20.transferFrom(msg.sender, address(this), fundingAmount), "F3");
        // require(settlerToken.transferFrom(msg.sender, address(this), settlerAmount), "F4");

        // totalSettlerLocked = totalSettlerLocked.add(settlerAmount);
    }

    /// @dev enable users to retract their funding
    function retractFunds(
        uint256 id,
        uint256[] calldata fundingIds
    ) bountyExists(id) isInDraft(id) public payable {

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        for (uint256 i = fundingIds.length; i >= 0; i--) {
            Benefactor storage x = bounty.benefactors[fundingIds[i]];
            require(x.benefactor == msg.sender, "RF1");
            require(x.amount > 0, "RF2");
            require(erc20.transfer(msg.sender, x.amount), "RF3");
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
    ) bountyExists(forBountyId) isOpen(forBountyId) isNotCanceled(forBountyId) public payable {


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
    ) bountyExists(ofBounty) isOpen(ofBounty) isNotCanceled(ofBounty) public payable {

        require(bounties[ofBounty].pullRequests.length <= prId, "CPR1");
        require(bounties[ofBounty].pullRequests[prId].canceled != false, "CPR2");
        require(bounties[ofBounty].pullRequests[prId].creator == msg.sender, "CPR3");

        for (uint256 i = 0; i <= bounties[ofBounty].proposals.length; i++) {
            require(bounties[ofBounty].proposals[i].prId != prId, "CPR4");
        }

        PullRequest storage pullRequest = bounties[ofBounty].pullRequests[prId];
        pullRequest.canceled = true;

        emit BountyPullRequestCanceled(ofBounty, prId);
    }

    /// @dev mark a PR ready for review
    function markPullRequestReadyForReview(
        uint256 bountyId,
        uint256 pullRequestId
    ) bountyExists(bountyId) isNotInDraft(bountyId) isNotCanceled(bountyId) isOpen(bountyId) public payable {

        require(bounties[bountyId].pullRequests.length - 1 <= pullRequestId, "PRR1");
        require(bounties[bountyId].pullRequests[pullRequestId].ready == false, "PRR2");
        require(bounties[bountyId].pullRequests[pullRequestId].creator == msg.sender, "PRR3");

        bounties[bountyId].pullRequests[pullRequestId].ready = true;

        emit BountyPullRequestReadyForReview(bountyId, pullRequestId);
    }

    /// @dev create a proposal with a pull request for a bounty
    function createBountyProposal(
        uint256 id,
        uint256 prId,
        address[] calldata recipients,
        uint256[] calldata percentages
    ) bountyExists(id) isNotInDraft(id) isOpen(id) isNotCanceled(id) public payable {
        require(getOraclesOf(msg.sender) >= councilAmount, "OW0");
        require(bounties[id].pullRequests.length <= prId, "CBP0");

        Bounty storage bounty = bounties[id];
        PullRequest storage pullRequest = bounty.pullRequests[prId];

        bounty.proposals.push();
        Proposal storage proposal = bounty.proposals[bounty.proposals.length - 1];

        proposal.id = bounty.proposals.length;
        proposal.prId = prId;
        proposal.creationDate = block.timestamp;

        uint256 _total = 0;

        for (uint i = 0; i < recipients.length; i++) {
            _total = _total.add(bounty.tokenAmount.div(100).mul(percentages[i]));
            proposal.details.push();
            proposal.details[i].recipient = recipients[i];
            proposal.details[i].percentage = percentages[i];
        }

        require(_total == bounty.tokenAmount, "CBP1");

        bounty.proposals.push(proposal);

        emit BountyProposalCreated(id, prId, proposal.id);
    }

    /// @dev dispute a proposal for a bounty
    function disputeBountyProposal(
        uint256 bountyId,
        uint256 proposalId
    ) bountyExists(bountyId) isNotInDraft(bountyId) isOpen(bountyId) isNotCanceled(bountyId) public payable {
        require(bounties[bountyId].proposals.length <= proposalId, "DBP0");
        require(oracles[msg.sender].disputes[bountyId][proposalId] == 0, "DBP1");

        uint256 weight = getOraclesOf(msg.sender);
        require(weight > 0, "DBP2");

        Proposal storage proposal = bounties[bountyId].proposals[proposalId];


        proposal.disputeWeight = proposal.disputeWeight.add(weight);
        oracles[msg.sender].disputes[bountyId][proposalId] = weight;

        emit BountyProposalDisputed(bountyId, proposal.prId, proposalId);
    }

    function refuseBountyProposal(
        uint256 bountyId,
        uint256 proposalId
    ) bountyExists(bountyId) isNotInDraft(bountyId) isOpen(bountyId) isNotCanceled(bountyId) isBountyOwner(bountyId) public payable {
        require(bounties[bountyId].proposals.length <= proposalId, "RBP0");
        bounties[bountyId].proposals[proposalId].refusedByBountyOwner = true;

        emit BountyProposalRefused(bountyId, bounties[bountyId].proposals[proposalId].prId, proposalId);
    }

    /// @dev close bounty with the selected proposal id
    function closeBounty(
        uint256 id,
        uint256 proposalId
    ) bountyExists(id) isOpen(id) isNotCanceled(id) isNotInDraft(id) public payable {
        require(bounties[id].proposals.length <= proposalId, "CB1");

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);

        Proposal storage proposal = bounty.proposals[proposalId];
        require(isProposalInDraft(id, proposalId) == false, "CB2");
        require(isProposalDisputed(id, proposalId) == false, "CB3");
        require(isProposalRefused(id, proposalId) == false, "CB7");

        bounty.closed = true;
        bounty.closedDate = block.timestamp;

        uint256 mergerFee = bounty.tokenAmount.div(100 * calculatePercentPerTenK(mergeCreatorFeeShare));
        uint256 proposerFee = bounty.tokenAmount.sub(mergerFee).div(100 * calculatePercentPerTenK(proposerFeeShare));

        uint256 proposalAmount = bounty.tokenAmount.sub(mergerFee).sub(proposerFee);
        require(erc20.transfer(msg.sender, mergerFee), "CB4");
        require(erc20.transfer(proposal.creator, proposerFee), "CB4");

        for (uint256 i = 0; i < proposal.details.length; i++) {
            ProposalDetail memory detail = proposal.details[i];
            require(erc20.transfer(detail.recipient, proposalAmount.mul(detail.percentage.div(100))), "CB5");
            nftToken.awardBounty(detail.recipient, bountyNftUri, bounty.id, detail.percentage);
        }

        if (bounties[id].rewardToken != address(0)) {
            ERC20 rewardToken = ERC20(bounty.rewardToken);
            for (uint256 i = 0; i < bounty.funding.length; i++) {
                Benefactor storage x = bounty.funding[i];
                if (x.amount > 0) {
                    uint256 rewardAmount = (x.amount / bounty.fundingAmount) * bounty.rewardAmount;
                    require(rewardToken.transfer(x.benefactor, rewardAmount), "CB6");
                    x.amount = 0;
                }
            }
        }

        closedBounties = closedBounties.add(1);

        emit BountyDistributed(id, proposalId);
    }
}
