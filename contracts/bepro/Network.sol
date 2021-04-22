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

    _IERC20 public beproToken = _IERC20(0xCF3C8Be2e2C42331Da80EF210e9B1b307C03d36A);

    uint256 constant private year = 365 days;
    uint256 public incrementIssueID = 1;
    uint256 public closedIdsCount = 0;
    uint256 public totalStaked = 0;
    address public feeAddress = 0xCF3C8Be2e2C42331Da80EF210e9B1b307C03d36A;
    uint256 public feeShare = 2; // 2%

    mapping(uint256 => Issue) public issues; /* Distribution object */
    mapping(address => uint256[]) public myIssues; /* Address Based Subcription */
    mapping(uint256 => uint256) public openIssueMapIndex; /* Distribution object */

     struct Issue {
        uint256 _id;
        uint256 beproStaked;
        address issueGenerator;
        bool finalized;
        address[] prAddresses;
        uint256[] prAmounts;
    }

    event OpenIssue(uint256 indexed id, address indexed opener, uint256 indexed amount);
    event CloseIssue(uint256 indexed id, address[] indexed addresses);

    constructor() public { }

    /**
     * @dev open an Issue with bepro owned
     */
    function openIssue(uint256 _beproAmount) public whenNotPaused {
        // Open Issue
        Issue memory issue;
        issue._id = incrementIssueID;
        issue.beproStaked = _beproAmount;
        issue.issueGenerator = msg.sender;
        issue.finalized = false;
        issues[incrementIssueID] = issue;
        myIssues[msg.sender].push(incrementIssueID);
        // Stake bepro
        require(beproToken.transferFrom(msg.sender, address(this), _beproAmount), "Needs Allowance");
        totalStaked = totalStaked.add(_beproAmount);
        incrementIssueID = incrementIssueID + 1;
        emit OpenIssue(incrementIssueID, msg.sender, _beproAmount);
    }

    /**
     * @dev update an Issue with bepro owned
     */
    function updateIssue(uint256 _issueId, uint256 _newbeproAmount) public whenNotPaused onlyOwner{
        require(issues[_issueId].beproStaked != 0, "Issue has to exist");
        uint256 previousAmount = issues[_issueId].beproStaked;
        // Update Issue
        issues[_issueId].beproStaked = _newbeproAmount;
        // Stake bepro
        if(_newbeproAmount > previousAmount){
            require(beproToken.transferFrom(msg.sender, address(this), _newbeproAmount.sub(previousAmount)), "Needs Allowance");
            totalStaked = totalStaked.add(_newbeproAmount.sub(previousAmount));
        }else{
            require(beproToken.transfer(issues[_issueId].issueGenerator, previousAmount.sub(_newbeproAmount)), "Transfer not sucessful");
            totalStaked = totalStaked.sub(previousAmount.sub(_newbeproAmount));
        }

    }

    /**
     * @dev Owner finalizes the issue and distributes the reputation or rejects the PR
     * @param _issueID issue id (mapping with github)
     * @param _prAddresses PR Address
     * @param _prAmounts PR Amounts
     */
    function closeIssue(uint256 _issueID, address[] memory _prAddresses, uint256[] memory _prAmounts) public whenNotPaused onlyOwner {
        require(issues[_issueID]._id != 0 , "Issue has to exist");
        require(issues[_issueID].finalized == false, "Issue has to be opened");
        require(_prAmounts.length == _prAddresses.length, "Amounts has to equal addresses length");

        // Closes the issue
        issues[_issueID].finalized = true;
        issues[_issueID].prAddresses = _prAddresses;
        issues[_issueID].prAmounts = _prAmounts;
        uint256 total = ((issues[_issueID].beproStaked * feeShare) / 100); // Fee + 0

        for(uint i = 0; i < _prAddresses.length; i++){
            total = total.add((_prAmounts[i] * (100-feeShare)) / 100);
        }

        require(total == issues[_issueID].beproStaked, "Totals dont match");

        // Fee Transfer
        require(beproToken.transfer(feeAddress, (issues[_issueID].beproStaked * feeShare) / 100), "Has to transfer");
        
        // Generate Reputation Tokens
        for(uint i = 0; i < _prAddresses.length; i++){
            myIssues[_prAddresses[i]].push(_issueID);
            require(beproToken.transfer(_prAddresses[i], (_prAmounts[i] * (100-feeShare)) / 100), "Has to transfer");
        }

        closedIdsCount = closedIdsCount.add(1);

        emit CloseIssue(_issueID, _prAddresses);
    }

    function getIssuesByAddress(address _address) public returns (uint256[] memory){
        return myIssues[_address];
    }
    
    function getIssueById(uint256 _issueID) public returns (uint256, uint256, address, bool, address[] memory, uint256[] memory){
        Issue storage issue = issues[_issueID];
        return (issue._id, issue.beproStaked, issue.issueGenerator, issue.finalized, issue.prAddresses, issue.prAmounts);
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
