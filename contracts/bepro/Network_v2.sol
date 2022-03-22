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

    enum Params {
        councilAmount,
        disputableTime,
        draftTime,
        oracleExchangeRate,
        mergeCreatorFeeShare,
        percentageNeededForDispute
    }

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
    mapping(string => uint256) public cidBountyId;
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
    event Log(uint256 bountyId, uint256 mergerValue, uint256 proposerValue, uint256 distributionValue);
    event LogTransfer(uint256 bountyId, address to, uint256 distributionValue);

    // function _bountyExists(uint256 id) internal view {
    //     require((bounties.length - 1) <= id, "B0");
    // }

    function _isBountyOwner(uint256 id) internal view {
        require(bounties[id].creator == msg.sender, "OW1");
    }

    function _isFundingRequest(uint256 id, bool shouldBe) internal view {
        require((bounties[id].rewardToken != address(0)) == shouldBe, "BF1");
    }

    // function _isNotFundingRequest(uint256 id) internal view {
    //     require(bounties[id].rewardToken == address(0), "BF0");
    // }

    // function _isNotDraft(uint256 id) internal view {
    //     require(block.timestamp > bounties[id].creationDate.add(draftTime), "BDT0");
    // }

    function _isInDraft(uint256 id, bool shouldBe) internal view {
        require((bounties.length - 1) <= id, "B0");
        require((block.timestamp < bounties[id].creationDate.add(draftTime)) == shouldBe, "BDT1");
    }

    function _isNotCanceled(uint256 id) internal view {
        require(bounties[id].canceled == false, "B1");
    }

    function _isOpen(uint256 id) internal view {
        require(bounties[id].closed == false, "B3");
    }

    function _proposalExists(uint256 _bountyId, uint256 _proposalId) internal view {
        require(_proposalId <= bounties[_bountyId].proposals.length - 1, "DBP0");
    }

    function getBounty(uint256 id) public view returns (Bounty memory) {
        return bounties[id];
    }

    function getBountiesOfAddress(address owner) public view returns (uint256[] memory) {
        return bountiesOfAddress[owner];
    }

    function bountiesTotal() public view returns (uint256) {
        return bounties.length;
    }

    function lessThan20MoreThan1(uint256 value) internal {
        require(value <= 20 days, "T1");
        require(value >= 1 minutes, "T2");
    }

    function changeNetworkParameter(uint256 _parameter, uint256 _value) public payable onlyGovernor {
        if (_parameter == uint256(Params.councilAmount)) {
            require(_value >= 100000 * 10 ** settlerToken.decimals(), "C1");
            require(_value <= 50000000 * 10 ** settlerToken.decimals(), "C2");
            councilAmount = _value;
        } else if (_parameter == uint256(Params.draftTime)) {
            lessThan20MoreThan1(_value);
            draftTime = _value;
        } else if (_parameter == uint256(Params.disputableTime)) {
            lessThan20MoreThan1(_value);
            disputableTime = _value;
        } else if (_parameter == uint256(Params.percentageNeededForDispute)) {
            require(_value <= 10000, "D1");
            percentageNeededForDispute = _value;
        } else if (_parameter == uint256(Params.mergeCreatorFeeShare)) {
            require(calculatePercentPerTenK(_value) <= 10, "M1");
            mergeCreatorFeeShare = _value;
        } else if (_parameter == uint256(Params.oracleExchangeRate)) {
            require(_value >= 0, "EX0");
            oracleExchangeRate = _value;
        }
    }

    // function changeCouncilAmount(uint256 newAmount) public payable onlyGovernor {
    //     require(councilAmount >= 100000 * 10 ** settlerToken.decimals(), "C1");
    //     require(councilAmount <= 50000000 * 10 ** settlerToken.decimals(), "C2");
    //     councilAmount = newAmount;
    // }

    // function changeDraftTime(uint256 _draftTime) public payable onlyGovernor {
    //     lessThan20MoreThan1(_draftTime);
    //     draftTime = _draftTime;
    // }

    // function changeDisputableTime(uint256 _disputableTime) public payable onlyGovernor {
    //     lessThan20MoreThan1(_disputableTime);
    //     disputableTime = _disputableTime;
    // }

    // function changePercentageNeededForDispute(uint256 _percentageNeededForDispute) public payable onlyGovernor {
    //     require(_percentageNeededForDispute <= 10000, "D1");
    //     percentageNeededForDispute = _percentageNeededForDispute;
    // }

    // function changeMergeCreatorFeeShare(uint256 _mergeCreatorFeeShare) public payable onlyGovernor {
    //     require(calculatePercentPerTenK(_mergeCreatorFeeShare) <= 10, "M1");
    //     mergeCreatorFeeShare = _mergeCreatorFeeShare;
    // }

    // function changeOracleExchangeRate(uint256 _oracleExchangeRate) public payable onlyGovernor {
    //     require(_oracleExchangeRate >= 0, "EX0");
    //     oracleExchangeRate = _oracleExchangeRate;
    // }

    /// @dev get total amount of oracles of an address
    function getOraclesOf(address _address) public view returns (uint256) {
        return oracles[_address].oraclesDelegatedByOthers.add(oracles[_address].oraclesDelegated[_address]);
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

    function amountGT0(uint256 _amount) internal view {
        require(_amount > 0, "L0");
    }

    /// @dev Lock given amount into the oracle mapping
    function lock(uint256 tokenAmount) public payable {
        //require(tokenAmount > 0, "L0");
        amountGT0(tokenAmount);
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
            //require(rewardAmount > 0, "O2");
            amountGT0(rewardAmount);
            //require(fundingAmount > 0, "O3");
            amountGT0(fundingAmount);
            //ERC20 erc20 = ERC20(rewardToken);
            require(ERC20(rewardToken).transferFrom(msg.sender, address(this), rewardAmount));

            bounty.rewardAmount = rewardAmount;
            bounty.rewardToken = rewardToken;
            bounty.fundingAmount = fundingAmount;
            bounty.tokenAmount = 0;
            // bounty.settlerTokenRatio = settlerTokenRatio;
        } else {
            bounty.tokenAmount = tokenAmount;
            //ERC20 erc20 = ERC20(transactional);
            require(ERC20(transactional).transferFrom(msg.sender, address(this), tokenAmount), "O4");
        }

        cidBountyId[cid] = bounty.id;
        bountiesOfAddress[msg.sender].push(bounty.id);

        emit BountyCreated(bounty.id, bounty.cid, bounty.creator);
    }

    /// @dev user adds value to an existing bounty
    function supportBounty(uint256 id, uint256 tokenAmount) public payable {
        // _bountyExists(id);
        _isInDraft(id, true);
        _isFundingRequest(id, false);
        Bounty storage bounty = bounties[id];
        require(bounty.creator != msg.sender, "S0");

        bounty.benefactors.push(Benefactor(msg.sender, tokenAmount, block.timestamp));

        //ERC20 erc20 = ERC20(bounty.transactional);

        require(ERC20(bounty.transactional).transferFrom(msg.sender, address(this), tokenAmount), "S1");
        bounty.tokenAmount = bounty.tokenAmount.add(tokenAmount);
    }

    /// @dev user removes its beneficiary entry
    function retractSupportFromBounty(uint256 bountyId, uint256 entryId) public payable {
        // _bountyExists(bountyId);
        _isInDraft(bountyId, true);
        _isFundingRequest(bountyId, false);
        Bounty storage bounty = bounties[bountyId];
        //ERC20 erc20 = ERC20(bounty.transactional);

        //require(bounty.benefactors[entryId].amount > 0, "R1");
        amountGT0(bounty.benefactors[entryId].amount);
        require(bounty.benefactors[entryId].benefactor == msg.sender, "R2");
        require(ERC20(bounty.transactional).transfer(msg.sender, bounty.benefactors[entryId].amount), "R3");

        bounty.tokenAmount = bounty.tokenAmount.sub(bounty.benefactors[entryId].amount);
        bounty.benefactors[entryId].amount = 0;
    }

    /// @dev cancel a bounty
    function cancelBounty(uint256 id) public payable {
        // _bountyExists(id);
        _isBountyOwner(id);
        _isInDraft(id, true);
        _isNotCanceled(id);
        _isFundingRequest(id, false);
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
    function cancelFundRequest(uint256 id) public payable {
        // _bountyExists(id);
        _isBountyOwner(id);
        _isInDraft(id, true);
        _isNotCanceled(id);
        _isFundingRequest(id, true);
        Bounty storage bounty = bounties[id];
        //ERC20 erc20 = ERC20(bounty.transactional);

        for (uint256 i = 0; i <= bounty.funding.length - 1; i++) {
            Benefactor storage x = bounty.funding[i];
            if (x.amount > 0) {
                require(ERC20(bounty.transactional).transfer(x.benefactor, x.amount), "C4");
                x.amount = 0;
            }
        }

        bounty.canceled = true;

        //ERC20 rewardToken = ERC20(bounty.rewardToken);
        require(ERC20(bounty.rewardToken).transfer(msg.sender, bounty.rewardAmount), "C5");
    }

    /// @dev update the value of a bounty with a new amount
    function updateBountyAmount(uint256 id, uint256 newTokenAmount) public payable {
        // _bountyExists(id);
        _isBountyOwner(id);
        _isInDraft(id, true);
        _isFundingRequest(id, false);

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
    function fundBounty(uint256 id, uint256 fundingAmount) public payable {
        // _bountyExists(id);
        _isFundingRequest(id, true);
        _isInDraft(id, true);
        _isNotCanceled(id);

        Bounty storage bounty = bounties[id];
        require(bounty.funded == false, "F1");
        require(bounty.tokenAmount < bounty.fundingAmount, "F2");
        require(bounty.tokenAmount < bounty.tokenAmount.add(fundingAmount), "F3");

        bounty.funding.push(Benefactor(msg.sender, fundingAmount, block.timestamp));

        bounty.tokenAmount = bounty.tokenAmount.add(fundingAmount);
        bounty.funded = bounty.fundingAmount == bounty.tokenAmount;

        //ERC20 erc20 = ERC20(bounty.transactional);
        // uint256 settlerAmount = fundingAmount * calculatePercentPerTenK(bounty.settlerTokenRatio);
        require(ERC20(bounty.transactional).transferFrom(msg.sender, address(this), fundingAmount), "F3");
        // require(settlerToken.transferFrom(msg.sender, address(this), settlerAmount), "F4");

        // totalSettlerLocked = totalSettlerLocked.add(settlerAmount);
    }

    /// @dev enable users to retract their funding
    function retractFunds(uint256 id, uint256[] calldata fundingIds) public payable {
        // _bountyExists(id);
        _isInDraft(id, true);
        _isFundingRequest(id, true);
        _isNotCanceled(id);

        Bounty storage bounty = bounties[id];

        for (uint256 i = 0; i <= fundingIds.length - 1; i++) {
            Benefactor storage x = bounty.funding[fundingIds[i]];
            require(x.benefactor == msg.sender, "RF1");
            //require(x.amount > 0, "RF2");
            amountGT0(x.amount);
            require(ERC20(bounty.transactional).transfer(msg.sender, x.amount), "RF3");
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
    ) public payable {

        // _bountyExists(forBountyId);
        _isOpen(forBountyId);
        _isNotCanceled(forBountyId);
        //_isNotDraft(forBountyId);
        _isInDraft(forBountyId, false);

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

    function cancelPullRequest(uint256 ofBounty, uint256 prId) public payable {

        // _bountyExists(ofBounty);
        _isOpen(ofBounty);
        //_isNotDraft(ofBounty);
        _isInDraft(ofBounty, false);
        _isNotCanceled(ofBounty);

        require(bounties[ofBounty].pullRequests.length <= prId, "CPR1");
        require(bounties[ofBounty].pullRequests[prId].canceled != false, "CPR2");
        require(bounties[ofBounty].pullRequests[prId].creator == msg.sender, "CPR3");

        for (uint256 i = 0; i <= bounties[ofBounty].proposals.length; i++) {
            require(bounties[ofBounty].proposals[i].prId != prId, "CPR4");
        }

        //PullRequest storage pullRequest = bounties[ofBounty].pullRequests[prId];
        bounties[ofBounty].pullRequests[prId].canceled = true;

        emit BountyPullRequestCanceled(ofBounty, prId);
    }

    /// @dev mark a PR ready for review
    function markPullRequestReadyForReview(uint256 bountyId, uint256 pullRequestId) public payable {
        // _bountyExists(bountyId);
        //_isNotDraft(bountyId);
        _isInDraft(bountyId, false);
        _isNotCanceled(bountyId);
        _isOpen(bountyId);

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
    ) public payable {
        // _bountyExists(id);
        //_isNotDraft(id);
        _isInDraft(id, false);
        _isOpen(id);
        _isNotCanceled(id);

        require(getOraclesOf(msg.sender) >= councilAmount, "OW0");
        require(prId <= bounties[id].pullRequests.length - 1, "CBP0");

        Bounty storage bounty = bounties[id];
        //PullRequest storage pullRequest = bounty.pullRequests[prId];

        bounty.proposals.push();
        Proposal storage proposal = bounty.proposals[bounty.proposals.length - 1];

        proposal.id = bounty.proposals.length - 1;
        proposal.prId = prId;
        proposal.creationDate = block.timestamp;
        proposal.creator = msg.sender;

        uint256 _total = 0;

        for (uint i = 0; i < recipients.length; i++) {
            _total = _total.add(bounty.tokenAmount.div(100).mul(percentages[i]));
            proposal.details.push();
            proposal.details[i].recipient = recipients[i];
            proposal.details[i].percentage = percentages[i];
        }

        require(_total == bounty.tokenAmount, "CBP1");

        emit BountyProposalCreated(id, prId, proposal.id);
    }

    /// @dev dispute a proposal for a bounty
    function disputeBountyProposal(uint256 bountyId, uint256 proposalId) public payable {
        // _bountyExists(bountyId);
        //_isNotDraft(bountyId);
        _isInDraft(bountyId, false);
        _isOpen(bountyId);
        _isNotCanceled(bountyId);
        _proposalExists(bountyId, proposalId);

        //require(proposalId <= bounties[bountyId].proposals.length - 1, "DBP0");
        require(oracles[msg.sender].disputes[bountyId][proposalId] == 0, "DBP1");

        uint256 weight = getOraclesOf(msg.sender);
        //require(weight > 0, "DBP2");
        amountGT0(weight);

        Proposal storage proposal = bounties[bountyId].proposals[proposalId];


        proposal.disputeWeight = proposal.disputeWeight.add(weight);
        oracles[msg.sender].disputes[bountyId][proposalId] = weight;

        emit BountyProposalDisputed(bountyId, proposal.prId, proposalId);
    }

    function refuseBountyProposal(uint256 bountyId, uint256 proposalId) public payable {

        // _bountyExists(bountyId);
        //_isNotDraft(bountyId);
        _isInDraft(bountyId, false);
        _isNotCanceled(bountyId);
        _isOpen(bountyId);
        _isBountyOwner(bountyId);
        _proposalExists(bountyId, proposalId);

        //require(proposalId <= bounties[bountyId].proposals.length - 1, "RBP0");
        bounties[bountyId].proposals[proposalId].refusedByBountyOwner = true;

        emit BountyProposalRefused(bountyId, bounties[bountyId].proposals[proposalId].prId, proposalId);
    }

    /// @dev close bounty with the selected proposal id
    function closeBounty(uint256 id, uint256 proposalId) public payable {
        // _bountyExists(id);
        _isOpen(id);
        _isNotCanceled(id);
        //_isNotDraft(id);
        _isInDraft(id, false);
        _proposalExists(id, proposalId);
        //require(proposalId <= bounties[id].proposals.length - 1, "CB1");

        Bounty storage bounty = bounties[id];
        ERC20 erc20 = ERC20(bounty.transactional);
        Proposal storage proposal = bounty.proposals[proposalId];

        require(block.timestamp >= bounty.proposals[proposalId].creationDate.add(disputableTime), "CB2");
        require(proposal.disputeWeight >= oraclesStaked.mul(percentageNeededForDispute).div(10000), "CB3");
        require(proposal.refusedByBountyOwner == false, "CB7");

        uint256 onehundred = 100;
        uint256 mergerFee = bounty.tokenAmount.div(100).mul(calculatePercentPerTenK(mergeCreatorFeeShare));
        uint256 proposerFee = bounty.tokenAmount.sub(mergerFee).div(100).mul(calculatePercentPerTenK(proposerFeeShare));
        uint256 proposalAmount = bounty.tokenAmount.sub(mergerFee).sub(proposerFee);

        /// event Log(uint256 bountyId, uint256 mergerValue, uint256 proposerValue, uint256 distributionValue);
        /// event LogTransfer(uint256 bountyId, address to, uint256 distributionValue);

        // emit Log(id, mergerFee, proposerFee, proposalAmount);

        require(erc20.transfer(msg.sender, mergerFee), "CB4");
        require(erc20.transfer(proposal.creator, proposerFee), "CB4");

        for (uint256 i = 0; i <= proposal.details.length - 1; i++) {
            ProposalDetail memory detail = proposal.details[i];
            require(erc20.transfer(detail.recipient, proposalAmount.div(100).mul(detail.percentage)), "CB5");
            // emit LogTransfer(id, detail.recipient, proposalAmount.div(100).mul(detail.percentage));
            nftToken.awardBounty(detail.recipient, bountyNftUri, bounty.id, detail.percentage);
        }

        if (bounties[id].rewardToken != address(0)) {
            ERC20 rewardToken = ERC20(bounty.rewardToken);
            for (uint256 i = 0; i <= bounty.funding.length - 1; i++) {
                Benefactor storage x = bounty.funding[i];
                if (x.amount > 0) {
                    uint256 rewardAmount = x.amount.div(bounty.fundingAmount).mul(bounty.rewardAmount);
                    require(rewardToken.transfer(x.benefactor, rewardAmount), "CB6");
                    x.amount = 0;
                }
            }
        }

        bounty.closed = true;
        bounty.closedDate = block.timestamp;
        closedBounties = closedBounties.add(1);

        emit BountyDistributed(id, proposalId);
    }
}
