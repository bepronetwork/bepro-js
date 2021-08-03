pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../utils/Governed.sol";


/**
 * @dev Interface of the ERC20 standard + mint & burn
 */
interface _IERC20 is IERC20  {

    /**
    * @dev Mint Function
    */
    function mint(address account, uint256 amount) external;

    /**
    * @dev Burn Function
    */
    function burn(address account, uint256 amount) external;

    function decimals() external returns (uint256);
}


/**
 * @title Development Network Contract Autonomous Use
 */
contract Network is Pausable, Governed{
    using SafeMath for uint256;

    _IERC20 public settlerToken;
    _IERC20 public transactionToken;

    uint256 constant private year = 365 days;
    uint256 public incrementIssueID = 1;
    uint256 public closedIdsCount = 0;
    uint256 public totalStaked = 0;
    uint256 public mergeCreatorFeeShare = 1; // (%) - Share to go to the merge proposal creator
    uint256 public percentageNeededForDispute = 3; // (%) - Amount needed to approve a PR and distribute the rewards
    uint256 public disputableTime = 3 days;
    uint256 public oraclesStaked = 0;

    uint256 public COUNCIL_AMOUNT = 25000000; // 25M

    mapping(uint256 => Issue) public issues; /* Distribution object */
    mapping(address => uint256[]) public myIssues; /* Address Based Subcription */

    mapping(address => Oracler) public oraclers; 
    address[] public oraclersArray; 


    struct MergeProposal {
        uint256 _id;
        uint256 creationDate;
        mapping(address => uint256) disputesForMergeByAddress; // Address -> oracles for that merge
        uint256 oracles; // Amount of oracles set
        uint256 disputes; // Amount of oracles set
        address[] prAddresses;
        uint256[] prAmounts;
        address proposalAddress;
    }

    struct Issue {
        uint256 _id;
        string cid;
        uint256 creationDate;
        uint256 tokensStaked;
        address issueGenerator;
        mapping(uint256 => MergeProposal) mergeProposals; // Id -> Merge Proposal
        uint256 mergeIDIncrement;
        bool finalized;
        bool canceled;
    }

    struct Oracler {
        uint256 oraclesDelegatedByOthers;
        mapping(address => uint256) oraclesDelegated;
        address[] delegatedOraclesAddresses;
        uint256 tokensLocked;
    }

    event OpenIssue(uint256 indexed id, address indexed opener, uint256 indexed amount);
    event RedeemIssue(uint256 indexed id);
    event MergeProposalCreated(uint256 indexed id, uint256 indexed mergeID, address indexed creator);
    event DisputeMerge(uint256 indexed id, uint256 indexed mergeID, uint256 oracles, address indexed disputer);
    event CloseIssue(uint256 indexed id, uint256 indexed mergeID, address[] indexed addresses);

    constructor(address _settlerToken, address _transactionToken, address _governor) public { 
        settlerToken = _IERC20(_settlerToken);
        transactionToken = _IERC20(_transactionToken);
        _governor = _governor;
    }

    function lock(uint256 _tokenAmount) public {
        require(_tokenAmount > 0, "Token Amount has to be higher than 0");
        require(settlerToken.transferFrom(msg.sender, address(this), _tokenAmount), "Needs Allowance");

        if(oraclers[msg.sender].tokensLocked != 0){
            // Exists
            oraclers[msg.sender].oraclesDelegated[msg.sender] = oraclers[msg.sender].oraclesDelegated[msg.sender].add(_tokenAmount);
            oraclers[msg.sender].tokensLocked = oraclers[msg.sender].tokensLocked.add(_tokenAmount);
        }else{
            // Does not exist
            Oracler storage oracler = oraclers[msg.sender];
            oracler.tokensLocked = _tokenAmount;
            oracler.delegatedOraclesAddresses = [msg.sender];
            oracler.oraclesDelegated[msg.sender] = _tokenAmount;
            oraclersArray.push(msg.sender);
        }

        oraclesStaked = oraclesStaked.add(_tokenAmount);
    }

    function unlock(uint256 _tokenAmount, address _from) public {
        Oracler storage oracler = oraclers[msg.sender];
        require(oracler.tokensLocked >= _tokenAmount, "Has to have tokens to unlock");
        require(oracler.oraclesDelegated[_from] >= _tokenAmount, "From has to have enough tokens to unlock");

        oraclers[msg.sender].tokensLocked = oracler.tokensLocked.sub(_tokenAmount);
        oraclers[msg.sender].oraclesDelegated[_from] = oracler.oraclesDelegated[_from].sub(_tokenAmount);

        if(msg.sender != _from){
            oraclers[_from].oraclesDelegatedByOthers = oraclers[_from].oraclesDelegatedByOthers.sub(_tokenAmount);
        }

        require(settlerToken.transfer(msg.sender, _tokenAmount), "Transfer didnt work");
        oraclesStaked = oraclesStaked.sub(_tokenAmount);
    }

    function delegateOracles(uint256 _tokenAmount, address _delegatedTo) public {
        Oracler storage oracler = oraclers[msg.sender];

        require(_delegatedTo != address(0), "Cannot transfer to the zero address");
        require(_delegatedTo != msg.sender, "Cannot transfer to itself");

        require(oracler.tokensLocked >= _tokenAmount, "Has to have tokens to unlock");
        require(oracler.oraclesDelegated[msg.sender] >= _tokenAmount, "From has to have tokens to use to delegate");

        oraclers[msg.sender].oraclesDelegated[msg.sender] = oracler.oraclesDelegated[msg.sender].sub(_tokenAmount);
        oraclers[msg.sender].oraclesDelegated[_delegatedTo] = oracler.oraclesDelegated[_delegatedTo].add(_tokenAmount);

        //require(oraclers[_delegatedTo].tokensLocked != uint256(0), "Delegated to has to have oracled already");
        oraclers[_delegatedTo].oraclesDelegatedByOthers = oraclers[_delegatedTo].oraclesDelegatedByOthers.add(_tokenAmount);
    }

    function disputeMerge(uint256 _issueID, uint256 _mergeID) public {
        Oracler memory oracler = oraclers[msg.sender];
        Issue memory issue = issues[_issueID];
        MergeProposal storage merge = issues[_issueID].mergeProposals[_mergeID];
        require(issue._id != 0, "Issue does not exist");
        require(issue.mergeIDIncrement >  _mergeID, "Merge Proposal does not exist");
        require(merge.disputesForMergeByAddress[msg.sender] == 0, "Has already oracled");

        uint256 oraclesToAdd = getOraclesByAddress(msg.sender);
        
        issues[_issueID].mergeProposals[_mergeID].disputes = merge.disputes.add(oraclesToAdd);
        issues[_issueID].mergeProposals[_mergeID].disputesForMergeByAddress[msg.sender] = oraclesToAdd;
        
        emit DisputeMerge(_issueID, _mergeID, oraclesToAdd, msg.sender);
    }

    function isIssueInDraft(uint256 _issueID) public view returns (bool){
        // Only if in the open window
        require(issues[_issueID].creationDate != 0, "Issue does not exist");
        return (block.timestamp <= issues[_issueID].creationDate.add(disputableTime));
    }

    function isMergeDisputed(uint256 _issueID, uint256 _mergeID) public returns (bool) {
        require(issues[_issueID].creationDate != 0, "Issue does not exist");
        require(issues[_issueID].mergeProposals[_mergeID].proposalAddress != address(0), "Merge does not exist");
        return (issues[_issueID].mergeProposals[_mergeID].disputes >= oraclesStaked.mul(percentageNeededForDispute).div(100));
    }

    /**
     * @dev open an Issue with transaction Tokens owned
     * 1st step
     */
    function openIssue(string memory _cid, uint256 _tokenAmount) public whenNotPaused {
        // Open Issue
        Issue memory issue;
        issue._id = incrementIssueID;
        issue.cid = _cid;
        issue.tokensStaked = _tokenAmount;
        issue.issueGenerator = msg.sender;
        issue.creationDate = block.timestamp;
        issue.finalized = false;
        issues[incrementIssueID] = issue;
        myIssues[msg.sender].push(incrementIssueID);
        totalStaked = totalStaked.add(_tokenAmount);
        incrementIssueID = incrementIssueID + 1;
        // Transfer Transaction Token
        require(transactionToken.transferFrom(msg.sender, address(this), _tokenAmount), "Needs Allowance");
    
        emit OpenIssue(issue._id, msg.sender, _tokenAmount);
    }

    function redeemIssue(uint256 _issueId) public whenNotPaused {
        Issue storage issue = issues[_issueId];
        require(issue.issueGenerator == msg.sender, "Has to be the issue creator");
        require(isIssueInDraft(_issueId), "Draft Issue Time has already passed");
        require(!issue.finalized, "Issue was already finalized");
        require(!issue.canceled, "Issue was already canceled");

        issues[_issueId].finalized = true;
        issues[_issueId].canceled = true;
        require(transactionToken.transfer(msg.sender, issue.tokensStaked), "Transfer not sucessful");

        emit RedeemIssue(_issueId);
    }

    /**
     * @dev update an Issue with transaction tokens owned
     * 2nd step  (optional)
     */
    function updateIssue(uint256 _issueId, uint256 _newTokenAmount) public whenNotPaused {
        require(issues[_issueId].tokensStaked != 0, "Issue has to exist");
        require(issues[_issueId].issueGenerator == msg.sender, "Has to be the issue creator");
        require(isIssueInDraft(_issueId), "Draft Issue Time has already passed");

        uint256 previousAmount = issues[_issueId].tokensStaked;
        // Update Issue
        issues[_issueId].tokensStaked = _newTokenAmount;
        // Lock Transaction Tokens
        if(_newTokenAmount > previousAmount){
            require(transactionToken.transferFrom(msg.sender, address(this), _newTokenAmount.sub(previousAmount)), "Needs Allowance");
            totalStaked = totalStaked.add(_newTokenAmount.sub(previousAmount));
        }else{
            totalStaked = totalStaked.sub(previousAmount.sub(_newTokenAmount));
            require(transactionToken.transfer(msg.sender, previousAmount.sub(_newTokenAmount)), "Transfer not sucessful");
        }
    }

   /**
     * @dev Owner finalizes the issue and distributes the transaction tokens or rejects the PR
     * @param _issueID issue id (mapping with github)
     * @param _prAddresses PR Address
     * @param _prAmounts PR Amounts
     */
    function proposeIssueMerge(uint256 _issueID, address[] memory _prAddresses, uint256[] memory _prAmounts) public whenNotPaused {
        
        Issue memory issue = issues[_issueID];
        require(issue._id != 0 , "Issue has to exist");
        require(issue.finalized == false, "Issue has to be opened");
        require(_prAmounts.length == _prAddresses.length, "Amounts has to equal addresses length");
        require(transactionToken.balanceOf(msg.sender) > COUNCIL_AMOUNT*10**settlerToken.decimals(), "To propose merges the proposer has to be a Council (COUNCIL_AMOUNT)");

        MergeProposal memory mergeProposal;
        mergeProposal._id = issue.mergeIDIncrement;
        mergeProposal.prAmounts = _prAmounts;
        mergeProposal.prAddresses = _prAddresses;
        mergeProposal.proposalAddress = msg.sender;

        uint256 total = ((issues[_issueID].tokensStaked * (mergeCreatorFeeShare)) / 100); // Fee + Merge Creator Fee + 0

        for(uint i = 0; i < _prAddresses.length; i++){
            total = total.add((_prAmounts[i] * (100-mergeCreatorFeeShare)) / 100);
        }

        //require(total == issues[_issueID].tokensStaked, "Totals dont match");

        issues[_issueID].mergeProposals[issue.mergeIDIncrement] = mergeProposal;
        issues[_issueID].mergeIDIncrement = issues[_issueID].mergeIDIncrement + 1;
        emit MergeProposalCreated(_issueID, mergeProposal._id, msg.sender);
    }



    /**
     * @dev Owner finalizes the issue and distributes the transaction tokens or rejects the PR
     * @param _issueID issue id (mapping with github)
     * @param _mergeID merge id 
     */
    function closeIssue(uint256 _issueID, uint256 _mergeID) public whenNotPaused {
        Issue memory issue = issues[_issueID];
        require(issue._id != 0 , "Issue has to exist");
        require(issue.finalized == false, "Issue has to be opened");
        require(issue.mergeIDIncrement >  _mergeID, "Merge Proposal does not exist");
        require(!isIssueInDraft(_issueID), "Issue cant be in Draft Mode");
        require(!isMergeDisputed(_issueID, _mergeID), "Merge has been disputed");

        // Closes the issue
        issues[_issueID].finalized = true;
        MergeProposal memory merge = issues[_issueID].mergeProposals[_mergeID];

        // Merge Creator Transfer
        require(transactionToken.transfer(merge.proposalAddress, (issues[_issueID].tokensStaked * mergeCreatorFeeShare) / 100), "Has to transfer");
        
        // Generate Transaction Tokens
        for(uint i = 0; i < merge.prAddresses.length; i++){
            myIssues[merge.prAddresses[i]].push(_issueID);
            require(transactionToken.transfer(merge.prAddresses[i], (merge.prAmounts[i] * (100-mergeCreatorFeeShare)) / 100), "Has to transfer");
        }

        closedIdsCount = closedIdsCount.add(1);
        totalStaked = totalStaked.sub(issue.tokensStaked);
        emit CloseIssue(_issueID, _mergeID, merge.prAddresses);
    }

    function getIssuesByAddress(address _address) public returns (uint256[] memory){
        return myIssues[_address];
    }

    function getOraclesByAddress(address _address) public returns (uint256){
        Oracler storage oracler = oraclers[_address];
        return oracler.oraclesDelegatedByOthers.add(oracler.oraclesDelegated[_address]);
    }

    function getOraclesSummary(address _address) public returns (uint256, uint256[] memory, address[] memory, uint256){

    
        Oracler storage oracler = oraclers[_address];

        uint256[] memory amounts = new uint256[](oracler.delegatedOraclesAddresses.length);
        address[] memory addresses = new address[](oracler.delegatedOraclesAddresses.length);

        for(uint i=0; i < oracler.delegatedOraclesAddresses.length; i++){
            addresses[i] = (oracler.delegatedOraclesAddresses[i]);
            amounts[i] = (oracler.oraclesDelegated[oracler.delegatedOraclesAddresses[i]]);
        }

        return (oracler.oraclesDelegatedByOthers, amounts, addresses, oracler.tokensLocked);
    }
    
    function getIssueById(uint256 _issueID) public returns (uint256, string memory, uint256, uint256, address, uint256, bool, bool){
        Issue memory issue = issues[_issueID];
        return (issue._id, issue.cid, issue.creationDate, issue.tokensStaked, issue.issueGenerator, issue.mergeIDIncrement, issue.finalized, issue.canceled);
    }

    function getMergeById(uint256 _issueID, uint256 _mergeId) public returns (uint256, uint256, uint256, address[] memory, uint256[] memory, address){
        MergeProposal memory merge = issues[_issueID].mergeProposals[_mergeId];
        return (merge._id, merge.oracles, merge.disputes, merge.prAddresses, merge.prAmounts, merge.proposalAddress);
    }

    /**
     * @dev Change Merge Creator FeeShare
     */
    function changeMergeCreatorFeeShare(uint256 _mergeCreatorFeeShare) public onlyGovernor {
        require(_mergeCreatorFeeShare < 20, "Merge Share can´t be higher than 20");
        mergeCreatorFeeShare = _mergeCreatorFeeShare;
    }

    /**
     * @dev changePercentageNeededForDispute
     */
    function changePercentageNeededForDispute(uint256 _percentageNeededForDispute) public onlyGovernor {
        require(_percentageNeededForDispute < 15, "Dispute % Needed can´t be higher than 15");
        percentageNeededForDispute = _percentageNeededForDispute;
    }

     /**
     * @dev changedisputableTime
     */
    function changeDisputableTime(uint256 _disputableTime) public onlyGovernor {
        require(_disputableTime < 20 days, "Time open for issue has to be higher than lower than 20 days");
        require(_disputableTime >= 1 minutes, "Time open for issue has to be higher than 1 minutes");
        disputableTime = _disputableTime;
    }

    /**
     * @dev changeTimeOpenForIssueApprove
    */
    function changeCOUNCIL_AMOUNT(uint256 _COUNCIL_AMOUNT) public onlyGovernor {
        require(_COUNCIL_AMOUNT > 100000*10**settlerToken.decimals(), "Council Amount has to higher than 100k");
        require(_COUNCIL_AMOUNT < 100000000*10**settlerToken.decimals(), "Council Amount has to lower than 50M");
        COUNCIL_AMOUNT = _COUNCIL_AMOUNT;
    }

 
}
