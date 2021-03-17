pragma solidity 0.5.8; 

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     *
     * _Available since v2.4.0._
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

// File: openzeppelin-solidity/contracts/token/ERC20/ERC20.sol

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) public view returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
  function approve(address spender, uint256 value) public returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    constructor() public {
        owner = msg.sender;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

// File: openzeppelin-solidity/contracts/lifecycle/Pausable.sol

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;


    /**
    * @dev Modifier to make a function callable only when the contract is not paused.
    */
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    /**
    * @dev Modifier to make a function callable only when the contract is paused.
    */
    modifier whenPaused() {
        require(paused);
        _;
    }

    /**
    * @dev called by the owner to pause, triggers stopped state
    */
    function pause() onlyOwner whenNotPaused public {
        paused = true;
        emit Pause();
    }

    /**
    * @dev called by the owner to unpause, returns to normal state
    */
    function unpause() onlyOwner whenPaused public {
        paused = false;
        emit Unpause();
    }
}

contract StakingContract is Pausable {
    using SafeMath for uint256;

    mapping(uint256 => ProductAPR) public products; /* Available Products */
    uint256[] public productIds; /* Available Product Ids*/
    mapping(address => uint256[]) public mySubscriptions; /* Address Based Subcriptions */
    uint256 incrementId = 0;
    uint256 lockedTokens = 0;

    uint256 constant private year = 365 days;
    
    ERC20 public erc20;

    struct SubscriptionAPR {
        uint256 _id;
        uint256 productId;
        uint256 startDate;
        uint256 endDate;
        uint256 amount;
        address subscriberAddress;
        uint256 APR; /* APR for this product */
        bool finalized;
        uint256 withdrawAmount;
    }

    struct ProductAPR {
        uint256 createdAt;
        uint256 startDate;
        uint256 endDate;
        uint256 totalMaxAmount;
        uint256 individualMinimumAmount;
        uint256 APR; /* APR for this product */
        uint256 currentAmount;
        bool lockedUntilFinalization; /* Product can only be withdrawn when finalized */
        address[] subscribers;
        uint256[] subscriptionIds;
        mapping(uint256 => SubscriptionAPR) subscriptions; /* Distribution object */
    }
    
    constructor(address _tokenAddress) public {
        erc20 = ERC20(_tokenAddress);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encode(block.difficulty, now)));
    } 
    
    /* Current Held Tokens */
    function heldTokens() public view returns (uint256) {
        return erc20.balanceOf(address(this));
    }

    /* Locked Tokens for the APR */
    function futureLockedTokens() public view returns (uint256) {
        return lockedTokens;
    }

    /* Available Tokens to he APRed by future subscribers */
    function availableTokens() public view returns (uint256) {
        return heldTokens().sub(futureLockedTokens());
    }

    function subscribeProduct(uint256 _product_id, uint256 _amount) external whenNotPaused {

        uint256 time = block.timestamp;
        /* Confirm Amount is positive */
        require(_amount > 0);
     
        /* Confirm product still exists */
        require(block.timestamp < products[_product_id].endDate);

        /* Confirm Subscription prior to opening */
        if(block.timestamp < products[_product_id].startDate){
            time = products[_product_id].startDate;
        }
        
        /* Confirm Max Amount was not hit already */
        require(products[_product_id].totalMaxAmount > (products[_product_id].currentAmount + _amount));

        /* Confirm Amount is bigger than minimum Amount */
        require(_amount >= products[_product_id].individualMinimumAmount);
        
        uint256 futureAPRAmount = getAPRAmount(products[_product_id].APR, time, products[_product_id].endDate, _amount);

        /* Confirm the current funds can assure the user the APR is valid */
        require(availableTokens() >= futureAPRAmount);

        /* Confirm the user has funds for the transfer */
        require(erc20.transferFrom(msg.sender, address(this), _amount));

        /* Add to LockedTokens */
        lockedTokens = lockedTokens.add(_amount.add(futureAPRAmount));

        uint256 subscription_id = random().add(incrementId);
        incrementId = incrementId + 1;

        /* Create SubscriptionAPR Object */
        SubscriptionAPR memory subscriptionAPR = SubscriptionAPR(subscription_id, _product_id, time, products[_product_id].endDate, _amount, 
        msg.sender, products[_product_id].APR, false, 0);

        /* Create new subscription */
        mySubscriptions[msg.sender].push(subscription_id);
        products[_product_id].subscriptionIds.push(subscription_id);
        products[_product_id].subscriptions[subscription_id] = subscriptionAPR;
        products[_product_id].currentAmount = products[_product_id].currentAmount + _amount;
        products[_product_id].subscribers.push(msg.sender);
    }

    function createProduct(uint256 _startDate, uint256 _endDate, uint256 _totalMaxAmount, uint256 _individualMinimumAmount, uint256 _APR, bool _lockedUntilFinalization) external whenNotPaused onlyOwner {

        /* Confirmations */
        require(block.timestamp < _endDate);
        require(block.timestamp <= _startDate);
        require(_startDate < _endDate);
        require(_totalMaxAmount > 0);
        require(_individualMinimumAmount > 0);
        require(_totalMaxAmount > _individualMinimumAmount);
        require(_APR > 0);

        address[] memory addressesI;
        uint256[] memory subscriptionsI;
        
        /* Create ProductAPR Object */
        ProductAPR memory productAPR = ProductAPR(block.timestamp, _startDate, _endDate, _totalMaxAmount, _individualMinimumAmount, _APR, 0, _lockedUntilFinalization,
            addressesI, subscriptionsI);

        uint256 product_id = productIds.length + 1;

        /* Add Product to System */
        productIds.push(product_id);
        products[product_id] = productAPR;
    }


    function getAPRAmount(uint256 _APR, uint256 _startDate, uint256 _endDate, uint256 _amount) public pure returns(uint256) {
        return ((_endDate.sub(_startDate)).mul(_APR).mul(_amount)).div(year.mul(100));
    }

    function getProductIds() public view returns(uint256[] memory) {
        return productIds;
    }

    function getMySubscriptions(address _address) public view returns(uint256[] memory) {
        return mySubscriptions[_address];
    }

    function withdrawSubscription(uint256 _product_id, uint256 _subscription_id) external whenNotPaused {

        /* Confirm Product exists */
        require(products[_product_id].endDate != 0, "Product has expired");

        /* Confirm Subscription exists */
        require(products[_product_id].subscriptions[_subscription_id].endDate != 0, "Product does not exist");

        /* Confirm Subscription is not finalized */
        require(products[_product_id].subscriptions[_subscription_id].finalized == false, "Subscription was finalized already");

        /* Confirm Subscriptor is the sender */
        require(products[_product_id].subscriptions[_subscription_id].subscriberAddress == msg.sender, "Not the subscription owner");

        SubscriptionAPR memory subscription = products[_product_id].subscriptions[_subscription_id];

        /* Confirm start date has already passed */
        require(block.timestamp > subscription.startDate, "Now is below the start date");

        /* Confirm end date for APR */
        uint256 finishDate = block.timestamp;
        /* Verify if date has passed the end date */
        if(block.timestamp >= products[_product_id].endDate){
            finishDate = products[_product_id].endDate;
        }else{
            /* Confirm the Product can be withdrawn at any time */
            require(products[_product_id].lockedUntilFinalization == false, "Product has to close to be withdrawned");
        }

        uint256 APRedAmount = getAPRAmount(subscription.APR, subscription.startDate, finishDate, subscription.amount);
        require(APRedAmount > 0, "APR amount has to be bigger than 0");
        uint256 totalAmount = subscription.amount.add(APRedAmount);
        require(totalAmount > 0, "Total Amount has to be bigger than 0");

        /* Update Subscription */
        products[_product_id].subscriptions[_subscription_id].finalized = true;
        products[_product_id].subscriptions[_subscription_id].endDate = finishDate;
        products[_product_id].subscriptions[_subscription_id].withdrawAmount = totalAmount;

        /* Transfer funds to the subscriber address */
        require(erc20.transfer(subscription.subscriberAddress, totalAmount), "Transfer has failed");

        /* Sub to LockedTokens */
        lockedTokens = lockedTokens.sub(totalAmount);
    }   

    function getSubscription(uint256 _subscription_id, uint256 _product_id) external view returns (uint256, uint256, uint256, uint256, uint256, address, uint256, bool, uint256){

        SubscriptionAPR memory subscription = products[_product_id].subscriptions[_subscription_id];

        return (subscription._id, subscription.productId, subscription.startDate, subscription.endDate, 
            subscription.amount, subscription.subscriberAddress, subscription.APR, subscription.finalized, subscription.withdrawAmount);
    }
    
    function getProduct(uint256 _product_id) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool, address[] memory, uint256[] memory){

        ProductAPR memory product = products[_product_id];

        return (product.createdAt, product.startDate, product.endDate, product.totalMaxAmount, 
            product.individualMinimumAmount, product.APR, product.currentAmount, product.lockedUntilFinalization,
            product.subscribers, product.subscriptionIds
        );
    }
    
    function safeGuardAllTokens(address _address) external onlyOwner whenPaused  { /* In case of needed urgency for the sake of contract bug */
        require(erc20.transfer(_address, erc20.balanceOf(address(this))));
    }

    function changeTokenAddress(address _tokenAddress) external onlyOwner whenPaused  {
        /* If Needed to Update the Token Address (ex : token swap) */
        erc20 = ERC20(_tokenAddress);
    }
}