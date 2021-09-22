// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./utils/Ownable.sol";

contract StakingContract is Pausable, Ownable {
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
        uint256 individualMaximumAmount; /* FIX PF */
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
        require(_amount > 0, "Amount has to be bigger than 0");
     
        /* Confirm product still exists */
        require(block.timestamp < products[_product_id].endDate, "Already ended the subscription");

        /* Confirm Subscription prior to opening */
        if(block.timestamp < products[_product_id].startDate){
            time = products[_product_id].startDate;
        }

        /* Confirm the user has funds for the transfer */
        require(_amount <= erc20.allowance(msg.sender, address(this)), "Spender not authorized to spend this tokens, allow first");
        
        /* Confirm Max Amount was not hit already */
        require(products[_product_id].totalMaxAmount > (products[_product_id].currentAmount + _amount), "Max Amount was already hit");

        /* Confirm Amount is bigger than minimum Amount */
        require(_amount >= products[_product_id].individualMinimumAmount, "Has to be highger than minimum");
        
        /* Confirm Amount is smaller than maximum Amount */ /* FIX PF */
        require(_amount <= products[_product_id].individualMaximumAmount, "Has to be smaller than maximum");
        
        uint256 futureAPRAmount = getAPRAmount(products[_product_id].APR, time, products[_product_id].endDate, _amount);

        /* Confirm the current funds can assure the user the APR is valid */
        require(availableTokens() >= futureAPRAmount, "Available Tokens has to be higher than the future APR Amount");

        /* Confirm the user has funds for the transfer */
        require(erc20.transferFrom(msg.sender, address(this), _amount), "Transfer Failed");

        /* Add to LockedTokens */
        lockedTokens = lockedTokens.add(_amount.add(futureAPRAmount));

        uint256 subscription_id = incrementId;
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

    function createProduct(uint256 _startDate, uint256 _endDate, uint256 _totalMaxAmount, uint256 _individualMinimumAmount, uint256 _individualMaximumAmount, uint256 _APR, bool _lockedUntilFinalization) external whenNotPaused onlyOwner {

        /* Confirmations */
        require(block.timestamp < _endDate);
        require(block.timestamp <= _startDate);
        require(_startDate < _endDate);
        require(_totalMaxAmount > 0);
        require(_individualMinimumAmount > 0);
        require(_individualMaximumAmount > 0);
        require(_totalMaxAmount > _individualMinimumAmount);
        require(_totalMaxAmount > _individualMaximumAmount);
        require(_APR > 0);

        address[] memory addressesI;
        uint256[] memory subscriptionsI;
        
        /* Create ProductAPR Object */
        ProductAPR memory productAPR = ProductAPR(block.timestamp, _startDate, _endDate, _totalMaxAmount, _individualMinimumAmount, _individualMaximumAmount, _APR, 0, _lockedUntilFinalization,
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
        uint256 totalAmountWithFullAPR = subscription.amount.add(getAPRAmount(subscription.APR, subscription.startDate, products[_product_id].endDate, subscription.amount));
        require(totalAmount > 0, "Total Amount has to be bigger than 0");

        /* Update Subscription */
        products[_product_id].subscriptions[_subscription_id].finalized = true;
        products[_product_id].subscriptions[_subscription_id].endDate = finishDate;
        products[_product_id].subscriptions[_subscription_id].withdrawAmount = totalAmount;

        /* Transfer funds to the subscriber address */
        require(erc20.transfer(subscription.subscriberAddress, totalAmount), "Transfer has failed");

        /* Sub to LockedTokens */
        lockedTokens = lockedTokens.sub(totalAmountWithFullAPR);
    }   

    function getSubscription(uint256 _subscription_id, uint256 _product_id) external view returns (uint256, uint256, uint256, uint256, uint256, address, uint256, bool, uint256){

        SubscriptionAPR memory subscription = products[_product_id].subscriptions[_subscription_id];

        return (subscription._id, subscription.productId, subscription.startDate, subscription.endDate, 
            subscription.amount, subscription.subscriberAddress, subscription.APR, subscription.finalized, subscription.withdrawAmount);
    }
    
    function getProduct(uint256 _product_id) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool, address[] memory, uint256[] memory){

        ProductAPR memory product = products[_product_id];

        return (product.createdAt, product.startDate, product.endDate, product.totalMaxAmount, 
            product.individualMinimumAmount, product.individualMaximumAmount, product.APR, product.currentAmount, product.lockedUntilFinalization,
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
