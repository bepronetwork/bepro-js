pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../utils/Ownable.sol";


/**
 * @dev Interface of the ERC20 standard + mint & burn
 */
interface _IERC20 is IERC20  {

    function totalSupplyMax() external returns (uint256);
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
    _IERC20 public beproTicketToken;

    uint256 constant private year = 365 days;
    uint256 public incrementID = 1;
    uint256 public incrementIssueID = 1;
    uint256 public ticketGenAPR = 1000000; // 1 Ticket = 1M BEPRO Staked per Year (Operator)
    uint256 public totalStaked = 0;
    uint256 public totalTicketsStaked = 0;
    uint256 public ratioOfApproving = 60;

    mapping(uint256 => Issue) public issues; /* Distribution object */
    mapping(uint256 => Subscription) public subscriptions; /* Distribution object */
    mapping(address => uint256) public mySubscription; /* Address Based Subcription */
    mapping(address => uint256[]) public myIssues; /* Address Based Subcription */

    struct Subscription {
        uint256 _id;
        uint256 startDate;
        uint256 amount;
        uint256 ticketsAccumulatedNotClaimed;
        uint256 lastUpdateDate;
        address subscriberAddress;
    }

     struct Issue {
        uint256 _id;
        uint256 ticketsStaked;
        address issueGenerator;
        bool finalized;
        address[] prAddresses;
    }

    constructor() public { }


    function _updateTicketsAcumulated(uint256 _id) internal whenNotPaused {
        uint256 _newTickets = subscriptions[_id].ticketsAccumulatedNotClaimed.add(getTicketAPRAmount(
                subscriptions[_id].lastUpdateDate,
                block.timestamp,
                subscriptions[_id].amount
        ));
        if(beproTicketToken.totalSupply().add(_newTickets) <= beproTicketToken.totalSupplyMax()){
            subscriptions[_id].ticketsAccumulatedNotClaimed = _newTickets;
        }

        subscriptions[_id].lastUpdateDate = block.timestamp;
    }

    /**
     * @dev Stakes an Amount of tokens to generate tickets     
    */
    function stake(uint256 _amount) public whenNotPaused {
        uint256 id = mySubscription[msg.sender];
        if(id > 0){
            // has stake already
            subscriptions[id].amount = subscriptions[id].amount.add(_amount);
        }else{
            id = incrementID;
            // new stake
            Subscription memory subscription = Subscription(id, block.timestamp, _amount, 0, block.timestamp, msg.sender);
            subscriptions[id] = subscription;
            mySubscription[msg.sender] = id;
        }

        require(beproToken.transferFrom(msg.sender, address(this), _amount), "Needs Allowance");
        _updateTicketsAcumulated(id);
        totalStaked = totalStaked.add(_amount);
        incrementID = incrementID+1;
    }
       
    /**
     * @dev Unstakes an Amount of tokens to generate tickets
     */
    function unstake(uint256 _amount) public whenNotPaused {
        uint256 id = getSubscriptionID();
        require(subscriptions[id].amount >=_amount, "Amount to unstake has to be equal or less to current");
        uint256 newAmount = subscriptions[id].amount.sub(_amount);
        subscriptions[id].amount = newAmount;
        // Accumulated Tickets
        _updateTicketsAcumulated(id);
        // has stake already
        totalStaked = totalStaked.sub(_amount);
        require(beproToken.transfer(msg.sender, _amount), "Transfer not possible");

    }
   
    /**
     * @dev open an Issue with tickets owned
     */
    function openIssue(uint256 _ticketsAmount) public whenNotPaused {
        // Open Issue
        Issue memory issue;
        issue._id = incrementIssueID;
        issue.ticketsStaked = _ticketsAmount;
        issue.issueGenerator = msg.sender;
        issue.finalized = false;
        issues[incrementIssueID] = issue;
        // Stake tickets
        require(beproTicketToken.transferFrom(msg.sender, address(this), _ticketsAmount), "Needs Allowance");
        totalTicketsStaked = totalTicketsStaked.sub(_ticketsAmount);
        incrementIssueID = incrementIssueID + 1;
    }

    /**
     * @dev update an Issue with tickets owned
     */
    function updateIssue(uint256 _issueId, uint256 _newTicketsAmount) public whenNotPaused {
        require(issues[_issueId].issueGenerator == msg.sender, "Not owner");
        require(issues[_issueId].ticketsStaked != 0, "Issue has to exist");
        uint256 previousAmount = issues[_issueId].ticketsStaked;
        // Update Issue
        issues[_issueId].ticketsStaked = _newTicketsAmount;
        // Stake tickets
        if(_newTicketsAmount > previousAmount){
            require(beproTicketToken.transferFrom(msg.sender, address(this), _newTicketsAmount.sub(previousAmount)), "Needs Allowance");
            totalTicketsStaked = totalTicketsStaked.add(_newTicketsAmount.sub(previousAmount));
        }else{
            require(beproTicketToken.transfer(msg.sender, previousAmount.sub(_newTicketsAmount)), "Transfer not sucessful");
            totalTicketsStaked = totalTicketsStaked.sub(previousAmount.sub(_newTicketsAmount));
        }

    }

    /**
     * @dev Owner finalizes the issue and distributes the reputation or rejects the PR
     * @param _issueID issue id (mapping with github)
     * @param _prAddresses PR Address
     * @param _amounts Amounts
     */
    function closeIssue(uint256 _issueID, address[] memory _prAddresses, uint256[] memory _amounts) public whenNotPaused onlyOwner {
        require(issues[_issueID]._id != 0 , "Issue has to exist");
        require(issues[_issueID].finalized == false, "Issue has to be opened");
        require(_amounts.length == _prAddresses.length, "Amounts has to equal addresses length");

        // Closes the issue
        issues[_issueID].finalized = true;
        issues[_issueID].prAddresses = _prAddresses;
        uint256 total = 0;

        for(uint i = 0; i < _prAddresses.length; i++){
            total = total.add(_amounts[i]);
        }

        require(total == issues[_issueID].ticketsStaked, "Totals dont match");

        // Generate Reputation Tokens
        for(uint i = 0; i < _prAddresses.length; i++){
            myIssues[_prAddresses[i]].push(_issueID);
            require(beproTicketToken.transfer(_prAddresses[i], _amounts[i]), "Has to transfer");
        }
    }

     /**
     * @dev Claims Tickets generated by Staking BEPRO 
     */
    function claimTickets() public whenNotPaused {
        uint256 id = getSubscriptionID();
        _updateTicketsAcumulated(id);
        uint256 availableTickets = subscriptions[id].ticketsAccumulatedNotClaimed;
        // update subscription
        subscriptions[id].ticketsAccumulatedNotClaimed = 0;
        // mint tickets
        if(beproTicketToken.totalSupply().add(availableTickets) <= beproTicketToken.totalSupplyMax()){
            // Not all minted
            beproTicketToken.mint(msg.sender, availableTickets);
        }
    }

    /**
     * @dev Get Calculation of Amount of Tickets Available to Claim at any moment
     */
    function getTicketAPRAmount(uint256 _startDate, uint256 _endDate, uint256 _amount) public returns(uint256) {
        return ((_endDate.sub(_startDate)).mul(ticketGenAPR).mul(_amount)).div(year.mul(100));
    }

    /**
     * @dev Change BEPRO Token Address (Upgrade)
     */
    function changeBEPROAddress(address _newAddress) public onlyOwner {
        beproToken = _IERC20(_newAddress);
    }
     
    /**
     * @dev Change BEPRO Ticket Address (Upgrade)
     */
    function setBeproTicketToken(address _newAddress) public onlyOwner {
        beproTicketToken = _IERC20(_newAddress);
    }

    /**
     * @dev Change BEPRO Ticket Generation APR based on BEPRO Staked (Upgrade)
     */
    function editTicketGenAPR(uint256 _ticketGenAPR) public onlyOwner {
        ticketGenAPR = _ticketGenAPR;
    }

    /**
     * @dev Upgrade Contract Version
     */
    function upgradeContract(address _newContract) public onlyOwner whenPaused {
        //To be done
    }

    function getSubscriptionID() public returns (uint256) {
        uint256 id = mySubscription[msg.sender];
        require(id > 0, "No open subscription");
        return id;
    }

}
