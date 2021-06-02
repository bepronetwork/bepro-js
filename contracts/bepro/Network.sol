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
    uint256 public percentageNeededForApprove = 10; // (%) - Amount needed to approve a PR and distribute the rewards
    uint256 public percentageNeededForDispute = 3; // (%) - Amount needed to approve a PR and distribute the rewards
    uint256 public timeOpenForIssueApprove = 3 days;
    uint256 public percentageNeededForMerge = 20; // (%) - Amount needed to approve a PR and distribute the rewards
    uint256 public votesStaked = 0;

    uint256 public COUNCIL_AMOUNT = 25000000; // 25M

    mapping(uint256 => Issue) public issues; /* Distribution object */
    mapping(address => uint256[]) public myIssues; /* Address Based Subcription */

    mapping(address => Voter) public voters; 
    address[] public votersArray; 


    struct MergeProposal {
        uint256 _id;
        mapping(address => uint256) votesForMergeByAddress; // Address -> Votes for that merge
        mapping(address => uint256) disputesForMergeByAddress; // Address -> Votes for that merge
        uint256 votes; // Amount of votes set
        uint256 disputes; // Amount of votes set
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
        mapping(address => uint256) votesForApproveByAddress;
        uint256 votesForApprove;
        mapping(uint256 => MergeProposal) mergeProposals; // Id -> Merge Proposal
        uint256 mergeIDIncrement;
        bool finalized;
        bool canceled;
    }

    struct Voter {
        uint256 votesDelegatedByOthers;
        mapping(address => uint256) votesDelegated;
        address[] delegatedVotesAddresses;
        uint256 tokensLocked;
    }

    event OpenIssue(uint256 indexed id, address indexed opener, uint256 indexed amount);
    event ApproveIssue(uint256 indexed id, uint256 indexed votes, address indexed approver);
    event MergeProposalCreated(uint256 indexed id, uint256 indexed mergeID, address indexed creator);
    event DisputeMerge(uint256 indexed id, uint256 indexed mergeID, uint256 votes, address indexed disputer);
    event ApproveMerge(uint256 indexed id, uint256 indexed mergeID, uint256 votes, address indexed approver);
    event CloseIssue(uint256 indexed id, uint256 indexed mergeID, address[] indexed addresses);

    constructor(address _settlerToken, address _transactionToken, address _governor) public { 
        settlerToken = _IERC20(_settlerToken);
        transactionToken = _IERC20(_transactionToken);
        _governor = _governor;
    }

    function lock(uint256 _tokenAmount) public {
        require(_tokenAmount > 0, "Token Amount has to be higher than 0");
        require(settlerToken.transferFrom(msg.sender, address(this), _tokenAmount), "Needs Allowance");

        if(voters[msg.sender].tokensLocked != 0){
            // Exists
            voters[msg.sender].votesDelegated[msg.sender] = voters[msg.sender].votesDelegated[msg.sender].add(_tokenAmount);
            voters[msg.sender].tokensLocked = voters[msg.sender].tokensLocked.add(_tokenAmount);
        }else{
            // Does not exist
            Voter storage voter = voters[msg.sender];
            voter.tokensLocked = _tokenAmount;
            voter.delegatedVotesAddresses = [msg.sender];
            voter.votesDelegated[msg.sender] = _tokenAmount;
            votersArray.push(msg.sender);
        }
    }

    function unlock(uint256 _tokenAmount, address _from) public {
        Voter storage voter = voters[msg.sender];
        require(voter.tokensLocked >= _tokenAmount, "Has to have tokens to unlock");
        require(voter.votesDelegated[_from] >= _tokenAmount, "From has to have tokens to unlock");

        voters[msg.sender].tokensLocked = voter.tokensLocked.sub(_tokenAmount);
        voters[msg.sender].votesDelegated[_from] = voter.votesDelegated[_from].sub(_tokenAmount);
        if(msg.sender != _from){
            voters[_from].votesDelegatedByOthers = voters[_from].votesDelegatedByOthers.sub(_tokenAmount);
        }

        require(settlerToken.transfer(msg.sender, _tokenAmount), "Transfer didnt work");
        votesStaked.sub(_tokenAmount);
    }

    function delegateOracles(uint256 _tokenAmount, address _delegatedTo) internal {
        Voter storage voter = voters[msg.sender];

        require(_delegatedTo != address(0), "Cannot transfer to the zero address");
        require(_delegatedTo != msg.sender, "Cannot transfer to itself");

        require(voter.tokensLocked >= _tokenAmount, "Has to have tokens to unlock");
        require(voter.votesDelegated[msg.sender] >= _tokenAmount, "From has to have tokens to unlock");

        voters[msg.sender].votesDelegated[msg.sender] = voter.votesDelegated[msg.sender].sub(_tokenAmount);
        voters[msg.sender].votesDelegated[_delegatedTo] = voter.votesDelegated[_delegatedTo].add(_tokenAmount);

        require(voters[_delegatedTo].tokensLocked != uint256(0), "Delegated to has to have voted already");
        voters[_delegatedTo].votesDelegatedByOthers = voters[_delegatedTo].votesDelegatedByOthers.add(_tokenAmount);
    }

    function approveIssue(uint256 _issueID) public {
        Voter memory voter = voters[msg.sender];
        Issue memory issue = issues[_issueID];
        require(issue._id != 0, "Issue does not exist");
        require(isIssueApprovable(_issueID));
        require(issues[_issueID].votesForApproveByAddress[msg.sender] == 0, "Has already voted");

        uint256 votesToAdd = getVotesByAddress(msg.sender);
        issues[_issueID].votesForApprove = issues[_issueID].votesForApprove.add(votesToAdd);
        issues[_issueID].votesForApproveByAddress[msg.sender] = votesToAdd;

        emit ApproveIssue(_issueID, votesToAdd, msg.sender);
    }

    function approveMerge(uint256 _issueID, uint256 _mergeID) public {
        Voter memory voter = voters[msg.sender];
        Issue memory issue = issues[_issueID];
        MergeProposal storage merge = issues[_issueID].mergeProposals[_mergeID];
        require(issue._id != 0, "Issue does not exist");
        require(issue.mergeIDIncrement >  _mergeID, "Merge Proposal does not exist");
        require(merge.votesForMergeByAddress[msg.sender] == 0, "Has already voted");

        uint256 votesToAdd = getVotesByAddress(msg.sender);
        
        issues[_issueID].mergeProposals[_mergeID].votes = merge.votes.add(votesToAdd);
        issues[_issueID].mergeProposals[_mergeID].votesForMergeByAddress[msg.sender] = votesToAdd;
        
        emit ApproveMerge(_issueID, _mergeID, votesToAdd, msg.sender);
    }

    function disputeMerge(uint256 _issueID, uint256 _mergeID) public {
        Voter memory voter = voters[msg.sender];
        Issue memory issue = issues[_issueID];
        MergeProposal storage merge = issues[_issueID].mergeProposals[_mergeID];
        require(issue._id != 0, "Issue does not exist");
        require(issue.mergeIDIncrement >  _mergeID, "Merge Proposal does not exist");
        require(merge.disputesForMergeByAddress[msg.sender] == 0, "Has already voted");

        uint256 votesToAdd = getVotesByAddress(msg.sender);
        
        issues[_issueID].mergeProposals[_mergeID].disputes = merge.disputes.add(votesToAdd);
        issues[_issueID].mergeProposals[_mergeID].disputesForMergeByAddress[msg.sender] = votesToAdd;
        
        emit DisputeMerge(_issueID, _mergeID, votesToAdd, msg.sender);
    }

    function isIssueApprovable(uint256 _issueID) public returns (bool){
        // Only if in the open window
        return (issues[_issueID].creationDate.add(timeOpenForIssueApprove) < block.timestamp);
    }

    function isIssueApproved(uint256 _issueID) public returns (bool) {
        return (issues[_issueID].votesForApprove >= votesStaked.mul(percentageNeededForApprove).div(100));
    }

    function isMergeDisputed(uint256 _issueID, uint256 _mergeID) public returns (bool) {
        return (issues[_issueID].mergeProposals[_mergeID].disputes >= votesStaked.mul(percentageNeededForDispute).div(100));
    }

    function isMergeApproved(uint256 _issueID, uint256 _mergeID) public returns (bool) {
        return (issues[_issueID].mergeProposals[_mergeID].votes >= votesStaked.mul(percentageNeededForMerge).div(100));
    }
    
    function isMergeTheOneWithMoreVotes(uint256 _issueID, uint256 _mergeID) public returns (bool) {
        uint256 thisMergeVotes = issues[_issueID].mergeProposals[_mergeID].votes;
        for(uint8 i = 0; i < issues[_issueID].mergeIDIncrement; i++){
            if(issues[_issueID].mergeProposals[i].votes > thisMergeVotes){
                return false;
            }
        }
        return true;
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
        // Transfer Transaction Token
        require(transactionToken.transferFrom(msg.sender, address(this), _tokenAmount), "Needs Allowance");
        totalStaked = totalStaked.add(_tokenAmount);
        incrementIssueID = incrementIssueID + 1;
        emit OpenIssue(incrementIssueID, msg.sender, _tokenAmount);
    }

    function redeemIssue(uint256 _issueId) public whenNotPaused {
        require(issues[_issueId].issueGenerator == msg.sender, "Has to be the issue creator");
        require(!isIssueApproved(_issueId), "Issue has to not be approved");
        require(!isIssueApprovable(_issueId), "Time for approving has to be already passed");
        issues[_issueId].finalized = true;
        issues[_issueId].canceled = true;
        require(transactionToken.transfer(msg.sender, issues[_issueId].tokensStaked), "Transfer not sucessful");
    }

    /**
     * @dev update an Issue with transaction tokens owned
     * 2nd step  (optional)
     */
    function updateIssue(uint256 _issueId, uint256 _newTokenAmount) public whenNotPaused {
        require(issues[_issueId].tokensStaked != 0, "Issue has to exist");
        require(issues[_issueId].issueGenerator == msg.sender, "Has to be the issue creator");
        require(!isIssueApproved(_issueId), "Issue is already Approved");

        uint256 previousAmount = issues[_issueId].tokensStaked;
        // Update Issue
        issues[_issueId].tokensStaked = _newTokenAmount;
        // Lock Transaction Tokens
        if(_newTokenAmount > previousAmount){
            require(transactionToken.transferFrom(msg.sender, address(this), _newTokenAmount.sub(previousAmount)), "Needs Allowance");
            totalStaked = totalStaked.add(_newTokenAmount.sub(previousAmount));
        }else{
            require(transactionToken.transfer(msg.sender, previousAmount.sub(_newTokenAmount)), "Transfer not sucessful");
            totalStaked = totalStaked.sub(previousAmount.sub(_newTokenAmount));
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
        require(transactionToken.balanceOf(msg.sender) > COUNCIL_AMOUNT*10**18, "To propose merges the proposer has to be a Council (COUNCIL_AMOUNT)");

        MergeProposal memory mergeProposal;
        mergeProposal._id = issue.mergeIDIncrement;
        mergeProposal.prAmounts = _prAmounts;
        mergeProposal.prAddresses = _prAddresses;
        mergeProposal.proposalAddress = msg.sender;

        uint256 total = ((issues[_issueID].tokensStaked * (mergeCreatorFeeShare)) / 100); // Fee + Merge Creator Fee + 0

        for(uint i = 0; i < _prAddresses.length; i++){
            total = total.add((_prAmounts[i] * (100-mergeCreatorFeeShare)) / 100);
        }

        require(total == issues[_issueID].tokensStaked, "Totals dont match");

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
        require(isMergeApproved(_issueID, _mergeID), "Issue has to have passed voting");
        require(!isMergeDisputed(_issueID, _mergeID), "Merge has been disputed");
        require(isMergeTheOneWithMoreVotes(_issueID, _mergeID), "There is a merge proposal with more votes");

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

    function getVotesByAddress(address _address) public returns (uint256){
        Voter storage voter = voters[_address];
        return voter.votesDelegatedByOthers.add(voter.votesDelegated[_address]);
    }
    
    function getIssueById(uint256 _issueID) public returns (uint256, string memory, uint256, uint256, address, uint256, uint256, bool, bool){
        Issue memory issue = issues[_issueID];
        return (issue._id, issue.cid, issue.tokensStaked, issue.creationDate, issue.issueGenerator, issue.votesForApprove, issue.mergeIDIncrement, issue.finalized, issue.canceled);
    }

    function getMergeById(uint256 _issueID, uint256 _mergeId) public returns (uint256, uint256, uint256, address[] memory, uint256[] memory, address){
        MergeProposal memory merge = issues[_issueID].mergeProposals[_mergeId];
        return (merge._id, merge.votes, merge.disputes, merge.prAddresses, merge.prAmounts, merge.proposalAddress);
    }

    /**
     * @dev Change Transaction Token Address (Upgrade)
     */
    function changeTransactionToken(address _newToken) public onlyGovernor {
        transactionToken = _IERC20(_newToken);
    }

    /**
     * @dev Change Merge Creator FeeShare
     */
    function changeMergeCreatorFeeShare(uint256 _mergeCreatorFeeShare) public onlyGovernor {
        require(_mergeCreatorFeeShare < 20, "Merge Share can´t be higher than 20");
        mergeCreatorFeeShare = _mergeCreatorFeeShare;
    }

       /**
     * @dev changePercentageNeededForApprove
    */
    function changePercentageNeededForApprove(uint256 _percentageNeededForApprove) public onlyGovernor {
        require(_percentageNeededForApprove < 80, "Approve % Needed can´t be higher than 80");
        percentageNeededForApprove = _percentageNeededForApprove;
    }

    /**
     * @dev changePercentageNeededForDispute
     */
    function changePercentageNeededForDispute(uint256 _percentageNeededForDispute) public onlyGovernor {
        require(_percentageNeededForDispute < 15, "Dispute % Needed can´t be higher than 15");
        percentageNeededForDispute = _percentageNeededForDispute;
    }

    /**
     * @dev changePercentageNeededForMerge
     */
    function changePercentageNeededForMerge(uint256 _percentageNeededForMerge) public onlyGovernor {
        require(_percentageNeededForMerge < 80, "Approve for Merge % Needed can´t be higher than 80");
        percentageNeededForMerge = _percentageNeededForMerge;
    }

     /**
     * @dev changeTimeOpenForIssueApprove
     */
    function changeTimeOpenForIssueApprove(uint256 _timeOpenForIssueApprove) public onlyGovernor {
        require(_timeOpenForIssueApprove < 20 days, "Time open for issue has to be higher than lower than 20 days");
        require(_timeOpenForIssueApprove >= 1 minutes, "Time open for issue has to be higher than 1 minutes");
        timeOpenForIssueApprove = _timeOpenForIssueApprove;
    }

    /**
     * @dev changeTimeOpenForIssueApprove
    */
    function changeCOUNCIL_AMOUNT(uint256 _COUNCIL_AMOUNT) public onlyGovernor {
        require(_COUNCIL_AMOUNT > 100000*10**18, "Council Amount has to higher than 100k");
        require(_COUNCIL_AMOUNT < 100000000*10**18, "Council Amount has to lower than 50M");
        COUNCIL_AMOUNT = _COUNCIL_AMOUNT;
    }

 
}
