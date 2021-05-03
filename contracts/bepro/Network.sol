pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../utils/Ownable.sol";


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
 * @title BEPRO Network Contract
 */
contract BEPRONetwork is Pausable, Ownable{
    using SafeMath for uint256;

    _IERC20 public beproToken;

    uint256 constant private year = 365 days;
    uint256 public incrementIssueID = 1;
    uint256 public closedIdsCount = 0;
    uint256 public totalStaked = 0;
    address public feeAddress = 0xCF3C8Be2e2C42331Da80EF210e9B1b307C03d36A;
    uint256 public feeShare = 2; // (%) - Share to go to marketplace manager
    uint256 public mergeCreatorFeeShare = 1; // (%) - Share to go to the merge proposal creator
    uint256 public percentageNeededForApprove = 10; // (%) - Amount needed to approve a PR and distribute the rewards
    uint256 constant public timeOpenForIssueApprove = 3 days;
    uint256 public percentageNeededForMerge = 20; // (%) - Amount needed to approve a PR and distribute the rewards
    uint256 public beproVotesStaked = 0;

    uint256 public COUNCIL_BEPRO_AMOUNT = 10000000; // 10M
    uint256 public OPERATOR_BEPRO_AMOUNT = 1000000; // 1M
    uint256 public DEVELOPER_BEPRO_AMOUNT = 10000; // 10k

    mapping(uint256 => Issue) public issues; /* Distribution object */
    mapping(address => uint256[]) public myIssues; /* Address Based Subcription */

    mapping(address => Voter) public voters; 
    address[] public votersArray; 


    struct MergeProposal {
        uint256 _id;
        mapping(address => uint256) votesForMergeByAddress; // Address -> Votes for that merge
        uint256 votes; // Amount of votes set
        address[] prAddresses;
        uint256[] prAmounts;
        address proposalAddress;
    }

    struct Issue {
        uint256 _id;
        uint256 creationDate;
        uint256 beproStaked;
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
        uint256 beproLocked;
    }

    event OpenIssue(uint256 indexed id, address indexed opener, uint256 indexed amount);
    event ApproveIssue(uint256 indexed id, uint256 indexed votes, address indexed approver);
    event MergeProposalCreated(uint256 indexed id, uint256 indexed mergeID, address indexed creator);
    event ApproveMerge(uint256 indexed id, uint256 indexed mergeID, uint256 votes, address indexed approver);
    event CloseIssue(uint256 indexed id, uint256 indexed mergeID, address[] indexed addresses);

    constructor(address _tokenAddress) public { 
        beproToken = _IERC20(_tokenAddress);
    }

    function lockBepro(uint256 _beproAmount) public {
        require(_beproAmount > 0, "BEPRO Amount is to be higher than 0");
        require(beproToken.transferFrom(msg.sender, address(this), _beproAmount), "Needs Allowance");

        if(voters[msg.sender].beproLocked != 0){
            // Exists
            voters[msg.sender].votesDelegated[msg.sender] = voters[msg.sender].votesDelegated[msg.sender].add(_beproAmount);
            voters[msg.sender].beproLocked = voters[msg.sender].beproLocked.add(_beproAmount);
        }else{
            // Does not exist
            Voter storage voter = voters[msg.sender];
            voter.beproLocked = _beproAmount;
            voter.delegatedVotesAddresses = [msg.sender];
            voter.votesDelegated[msg.sender] = _beproAmount;
            votersArray.push(msg.sender);
        }
    }

    function unlockBepro(uint256 _beproAmount, address _from) public {
        Voter storage voter = voters[msg.sender];
        require(voter.beproLocked >= _beproAmount, "Has to have bepro to unlock");
        require(voter.votesDelegated[_from] >= _beproAmount, "From has to have bepro to unlock");

        voters[msg.sender].beproLocked = voter.beproLocked.sub(_beproAmount);
        voters[msg.sender].votesDelegated[_from] = voter.votesDelegated[_from].sub(_beproAmount);
        if(msg.sender != _from){
            voters[_from].votesDelegatedByOthers = voters[_from].votesDelegatedByOthers.sub(_beproAmount);
        }

        require(beproToken.transfer(msg.sender, _beproAmount), "Transfer didnt work");
        beproVotesStaked.sub(_beproAmount);
    }

    function delegateOracles(uint256 _beproAmount, address _delegatedTo) internal {
        Voter storage voter = voters[msg.sender];

        require(_delegatedTo != address(0), "Cannot transfer to the zero address");
        require(_delegatedTo != msg.sender, "Cannot transfer to itself");

        require(voter.beproLocked >= _beproAmount, "Has to have bepro to unlock");
        require(voter.votesDelegated[msg.sender] >= _beproAmount, "From has to have bepro to unlock");

        voters[msg.sender].votesDelegated[msg.sender] = voter.votesDelegated[msg.sender].sub(_beproAmount);
        voters[msg.sender].votesDelegated[_delegatedTo] = voter.votesDelegated[_delegatedTo].add(_beproAmount);

        require(voters[_delegatedTo].beproLocked != uint256(0), "Delegated to has to have voted already");
        voters[_delegatedTo].votesDelegatedByOthers = voters[_delegatedTo].votesDelegatedByOthers.add(_beproAmount);
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

    function isIssueApprovable(uint256 _issueID) public returns (bool){
        // Only if in the open window
        return (issues[_issueID].creationDate.add(timeOpenForIssueApprove) < block.timestamp);
    }

    function isIssueApproved(uint256 _issueID) public returns (bool) {
        return (issues[_issueID].votesForApprove >= beproVotesStaked.mul(percentageNeededForApprove).div(100));
    }

    function isIssueMergeable(uint256 _issueID, uint256 _mergeID) public returns (bool) {
        return (issues[_issueID].mergeProposals[_mergeID].votes >= beproVotesStaked.mul(percentageNeededForMerge).div(100));
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
     * @dev open an Issue with bepro owned
     * 1st step
     */
    function openIssue(uint256 _beproAmount) public whenNotPaused {
        // Open Issue
        Issue memory issue;
        issue._id = incrementIssueID;
        issue.beproStaked = _beproAmount;
        issue.issueGenerator = msg.sender;
        issue.creationDate = block.timestamp;
        issue.finalized = false;
        issues[incrementIssueID] = issue;
        myIssues[msg.sender].push(incrementIssueID);
        // Stake bepro
        require(beproToken.transferFrom(msg.sender, address(this), _beproAmount), "Needs Allowance");
        totalStaked = totalStaked.add(_beproAmount);
        incrementIssueID = incrementIssueID + 1;
        emit OpenIssue(incrementIssueID, msg.sender, _beproAmount);
    }

    function redeemIssue(uint256 _issueId) public whenNotPaused {
        require(issues[_issueId].issueGenerator == msg.sender, "Has to be the issue creator");
        require(!isIssueApproved(_issueId), "Issue has to not be approved");
        require(!isIssueApprovable(_issueID), "Time for approving has to be already passed");
        issues[_issueId].finalized = true;
        issues[_issueId].canceled = true;
        require(beproToken.transfer(msg.sender, issues[_issueId].beproStaked), "Transfer not sucessful");
    }



    /**
     * @dev update an Issue with bepro owned
     * 2nd step  (optional)
     */
    function updateIssue(uint256 _issueId, uint256 _newbeproAmount) public whenNotPaused {
        require(issues[_issueId].beproStaked != 0, "Issue has to exist");
        require(issues[_issueId].issueGenerator == msg.sender, "Has to be the issue creator");
        require(!isIssueApproved(_issueId), "Issue is already Approved");

        uint256 previousAmount = issues[_issueId].beproStaked;
        // Update Issue
        issues[_issueId].beproStaked = _newbeproAmount;
        // Stake bepro
        if(_newbeproAmount > previousAmount){
            require(beproToken.transferFrom(msg.sender, address(this), _newbeproAmount.sub(previousAmount)), "Needs Allowance");
            totalStaked = totalStaked.add(_newbeproAmount.sub(previousAmount));
        }else{
            require(beproToken.transfer(msg.sender, previousAmount.sub(_newbeproAmount)), "Transfer not sucessful");
            totalStaked = totalStaked.sub(previousAmount.sub(_newbeproAmount));
        }
    }

  /**
     * @dev Owner finalizes the issue and distributes the bepro or rejects the PR
     * @param _issueID issue id (mapping with github)
     * @param _prAddresses PR Address
     * @param _prAmounts PR Amounts
     */
    function proposeIssueMerge(uint256 _issueID, address[] memory _prAddresses, uint256[] memory _prAmounts) public whenNotPaused {
        
        Issue memory issue = issues[_issueID];
        require(issue._id != 0 , "Issue has to exist");
        require(issue.finalized == false, "Issue has to be opened");
        require(_prAmounts.length == _prAddresses.length, "Amounts has to equal addresses length");
        require(beproToken.balanceOf(msg.sender) > COUNCIL_BEPRO_AMOUNT*10**18, "To propose merges the proposer has to be a Council (COUNCIL_BEPRO_AMOUNT)");

        MergeProposal memory mergeProposal;
        mergeProposal._id = issue.mergeIDIncrement;
        mergeProposal.prAmounts = _prAmounts;
        mergeProposal.prAddresses = _prAddresses;
        mergeProposal.proposalAddress = msg.sender;

        uint256 total = ((issues[_issueID].beproStaked * (feeShare + mergeCreatorFeeShare)) / 100); // Fee + Merge Creator Fee + 0

        for(uint i = 0; i < _prAddresses.length; i++){
            require(beproToken.balanceOf(_prAddresses[i]) > DEVELOPER_BEPRO_AMOUNT*10**18, "To receive development rewards the rewarded has to be a Developer (DEVELOPER_BEPRO_AMOUNT)");
            total = total.add((_prAmounts[i] * (100-feeShare-mergeCreatorFeeShare)) / 100);
        }

        require(total == issues[_issueID].beproStaked, "Totals dont match");

        issues[_issueID].mergeProposals[issue.mergeIDIncrement] = mergeProposal;
        issues[_issueID].mergeIDIncrement = issues[_issueID].mergeIDIncrement + 1;
        emit MergeProposalCreated(_issueID, mergeProposal._id, msg.sender);
    }



    /**
     * @dev Owner finalizes the issue and distributes the bepro or rejects the PR
     * @param _issueID issue id (mapping with github)
     * @param _mergeID merge id 
     */
    function closeIssue(uint256 _issueID, uint256 _mergeID) public whenNotPaused {
        Issue memory issue = issues[_issueID];
        require(issue._id != 0 , "Issue has to exist");
        require(issue.finalized == false, "Issue has to be opened");
        require(issue.mergeIDIncrement >  _mergeID, "Merge Proposal does not exist");
        require(isIssueMergeable(_issueID, _mergeID), "Issue has to have passed voting");
        require(isMergeTheOneWithMoreVotes(_issueID, _mergeID), "There is a merge proposal with more votes");

        // Closes the issue
        issues[_issueID].finalized = true;
        MergeProposal memory merge = issues[_issueID].mergeProposals[_mergeID];

        // Fee Transfer
        require(beproToken.transfer(feeAddress, (issues[_issueID].beproStaked * feeShare) / 100), "Has to transfer");

        // Merge Creator Transfer
        require(beproToken.transfer(feeAddress, (issues[_issueID].beproStaked * mergeCreatorFeeShare) / 100), "Has to transfer");
        
        // Generate Reputation Tokens
        for(uint i = 0; i < merge.prAddresses.length; i++){
            myIssues[merge.prAddresses[i]].push(_issueID);
            require(beproToken.transfer(merge.prAddresses[i], (merge.prAmounts[i] * (100-feeShare-mergeCreatorFeeShare)) / 100), "Has to transfer");
        }

        closedIdsCount = closedIdsCount.add(1);
        totalStaked = totalStaked.sub(issue.beproStaked);
        emit CloseIssue(_issueID, _mergeID, merge.prAddresses);
    }

    function getIssuesByAddress(address _address) public returns (uint256[] memory){
        return myIssues[_address];
    }

    function getVotesByAddress(address _address) public returns (uint256){
        Voter storage voter = voters[_address];
        return voter.votesDelegatedByOthers.add(voter.votesDelegated[_address]);
    }
    
    function getIssueById(uint256 _issueID) public returns (uint256, uint256, uint256, address, uint256, uint256, bool, bool){
        Issue memory issue = issues[_issueID];
        return (issue._id, issue.beproStaked, issue.creationDate, issue.issueGenerator, issue.votesForApprove, issue.mergeIDIncrement, issue.finalized, issue.canceled);
    }

    function getMergeById(uint256 _issueID, uint256 _mergeId) public returns (uint256, uint256, address[] memory, uint256[] memory, address){
        MergeProposal memory merge = issues[_issueID].mergeProposals[_mergeId];
        return (merge._id, merge.votes, merge.prAddresses, merge.prAmounts, merge.proposalAddress);
    }

    /**
     * @dev Change BEPRO Token Address (Upgrade)
     */
    function changeBEPROAddress(address _newAddress) public onlyOwner {
        beproToken = _IERC20(_newAddress);
    }

    /**
     * @dev Change Fee Address
    */
    function editFeeAddress(address _newAddress) public onlyOwner {
        feeAddress = _newAddress;
    }

    /**
     * @dev Change Share Fee Amount
    */
    function editFeeShare(uint256 _feeShare) public onlyOwner {
        feeShare = _feeShare;
    }

    /**
     * @dev Upgrade Contract Version
     */
    function upgradeContract(address _newContract) public onlyOwner whenPaused {
        //To be done
    }
}
