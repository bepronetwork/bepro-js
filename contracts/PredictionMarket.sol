pragma solidity 0.5.8;

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

// File: openzeppelin-solidity/contracts/math/SafeMath.sol";

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

/// @title Market Contract Factory
contract PredictionMarket is Ownable {
  using SafeMath for uint;

  // ------ Events ------

  event ParticipantAction(
    address indexed participant,
    MarketAction indexed action,
    uint indexed marketId,
    uint outcomeId,
    uint shares,
    uint value,
    uint timestamp
  );

  event MarketOutcomePrice(
    uint indexed marketId,
    uint indexed outcomeId,
    uint value,
    uint timestamp
  );

  event MarketLiquidity(
    uint indexed marketId,
    uint value, // total liquidity (ETH)
    uint price, // value of 1 liquidity share; max: 1 ETH (50-50 situation)
    uint timestamp
  );

  event MarketResolved(
    address indexed oracle,
    uint indexed marketId,
    uint outcomeId
  );

  // ------ Events End ------

  uint256 constant public MAX_UINT_256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935;

  uint constant public ONE = 10**18;

  enum MarketState { open, closed, resolved }
  enum MarketAction { buy, sell, addLiquidity, removeLiquidity, claimWinnings, claimLiquidity }

  struct Market {
    string name;
    uint closedDateTime;

    uint liquidityTotal; // total stake (ETH)
    uint liquidityAvailable; // stake held (ETH)

    uint sharesTotal; // total shares (all outcomes)
    uint sharesAvailable; // shares held (all outcomes)

    MarketState state;

    // resolution variables
    string oracleUrl;
    address oracle;
    uint resolvedOutcomeId;

    mapping(address => uint) holdersIndexes;
    mapping(address => uint) holdersShares;
    address[] holders;

    mapping(address => uint) liquidityIndexes;
    mapping(address => uint) liquidityShares;
    mapping(address => bool) liquidityClaims; // wether participant has claimed liquidity winnings
    address[] liquidityHolders;

    // fees
    uint fee; // fee taken from every transaction
    uint feePoolWeight; // internal var used to ensure pro-rate fee distribution
    mapping(address => uint) feesClaimed;

    // market outcomes
    uint[] outcomeIds;
    mapping(uint256 => MarketOutcome) outcomes;
  }

  struct MarketOutcome {
    uint marketId;
    uint256 index;
    uint256 id;
    string name;
    Shares shares;
  }

  struct Shares {
    uint256 total; // number of shares
    uint256 available; // available shares

    mapping(address => uint) holdersShares;
    mapping(address => uint) holdersIndexes;
    mapping(address => bool) holdersClaims; // wether participant has claimed liquidity winnings
    address[] holders;
  }

  uint[] marketIds;
  uint public fee; // fee % taken from every transaction, can be updated by contract owner
  mapping(uint256 => Market) public markets;
  uint public marketIndex = 0;

  // ------ Modifiers ------

  modifier isMarket(uint marketId) {
    require(marketId < marketIndex);
    _;
  }

  modifier timeTransitions(uint marketId) {
    if (now > markets[marketId].closedDateTime && markets[marketId].state == MarketState.open) {
      nextState(marketId);
    }
    _;
  }

  modifier atState(uint marketId, MarketState state) {
    require(markets[marketId].state == state);
    _;
  }

  modifier notAtState(uint marketId, MarketState state) {
    require(markets[marketId].state != state);
    _;
  }

  modifier onlyBy(address addr) {
    require(addr != address(0) && addr == msg.sender);
    _;
  }

  modifier participantHasShares(uint marketId, uint outcomeId, address sender) {
    require(markets[marketId].outcomes[outcomeId].shares.holdersShares[sender] > 0);
    _;
  }

  modifier participantHasLiquidity(uint marketId, address sender) {
    require(markets[marketId].liquidityShares[sender] > 0);
    _;
  }

  modifier transitionNext(uint marketId) {
    _;
    nextState(marketId);
  }

  // ------ Modifiers End ------

  /// Empty constructor
  constructor() public {
  }

  /// Fallback function does nothing
  function () external payable {
  }

  // ------ Core Functions ------

  /// Create a new Market contract
  /// @dev The new Market contract is then saved in the array of this contract for future reference.
  /// @param name - Name of the market
  /// @param closesAt - The duration of the market `open` period
  /// @param oracle - oracle address
  function createMarket(
    string memory name, uint closesAt, address oracle, string memory outcome1, string memory outcome2
  )
  public payable
  returns(uint)
  {
    uint marketId = marketIndex;
    marketIds.push(marketId);

    Market storage market = markets[marketId];

    string[2] memory outcomes = [outcome1, outcome2];

    require(msg.value > 0, "The stake has to be greater than 0.");
    require(closesAt >= now, "Market has to close after the current date");
    require(oracle == address(oracle), "Invalid oracle address");
    // starting with secondary markets
    require(outcomes.length == 2, "Number market outcome has to be 2");

    market.name = name;
    market.closedDateTime = closesAt;
    market.state = MarketState.open;
    market.oracle = oracle;
    market.fee = fee;
    // setting intial value to an integer that does not map to any outcomeId
    market.resolvedOutcomeId = MAX_UINT_256;

    market.liquidityTotal = msg.value;
    market.liquidityAvailable = msg.value;

    // adding liquidity tokens to market creator
    if (market.liquidityShares[msg.sender] == 0) {
      market.liquidityHolders.push(msg.sender);
      market.liquidityIndexes[msg.sender] = market.liquidityHolders.length - 1;
    }

    // TODO review: only valid for 50-50 start
    market.liquidityShares[msg.sender] = market.liquidityShares[msg.sender].add(msg.value);

    // creating market outcomes
    for (uint i = 0; i < outcomes.length; i++) {
      market.outcomeIds.push(i);
      MarketOutcome storage outcome = market.outcomes[i];

      outcome.marketId = marketId;
      outcome.index = i;
      outcome.id = i;
      outcome.name = outcomes[i];

      // TODO review: only valid for 50-50 start
      // price starts at .5 ETH
      outcome.shares.available = msg.value;
      outcome.shares.total = msg.value;

      market.sharesTotal = market.sharesTotal.add(msg.value);
      market.sharesAvailable = market.sharesAvailable.add(msg.value);
    }

    // emiting initial price events
    emitMarketOutcomePriceEvents(marketId);
    emit ParticipantAction(msg.sender, MarketAction.addLiquidity, marketId, 0, msg.value, msg.value, now);

    // incrementing market array index
    marketIndex = marketIndex + 1;

    return marketId;
  }

  function buy(uint marketId, uint outcomeId) public payable {
    buy(marketId, outcomeId, msg.value, MarketAction.buy);
  }

  /// Buy shares of a market outcome
  function buy(uint marketId, uint outcomeId, uint value, MarketAction parentAction) internal
    timeTransitions(marketId)
    atState(marketId, MarketState.open)
  {
    Market storage market = markets[marketId];

    if (parentAction == MarketAction.buy) {
      // subtracting fee from transaction value
      value = addTransactionToFeesPool(marketId, value);
    }

    MarketOutcome storage outcome = market.outcomes[outcomeId];
    market.liquidityTotal = parentAction == MarketAction.removeLiquidity
      ? market.liquidityTotal.sub(value)
      : market.liquidityTotal.add(value);

    uint newProductBalance = 1;

    // Funding market shares with received ETH
    for (uint i = 0; i < market.outcomeIds.length; i++) {
      MarketOutcome storage marketOutcome = market.outcomes[i];

      marketOutcome.shares.available = parentAction == MarketAction.removeLiquidity
        ? marketOutcome.shares.available.sub(value)
        : marketOutcome.shares.available.add(value);
      marketOutcome.shares.total = parentAction == MarketAction.removeLiquidity
        ? marketOutcome.shares.total.sub(value)
        : marketOutcome.shares.total.add(value);

      newProductBalance = newProductBalance.mul(marketOutcome.shares.available);

      // only adding to market total shares, the available remains
      market.sharesTotal = parentAction == MarketAction.removeLiquidity
        ? market.sharesTotal.sub(value)
        : market.sharesTotal.add(value);
      market.sharesAvailable = parentAction == MarketAction.removeLiquidity
        ? market.sharesAvailable.sub(value)
        : market.sharesAvailable.add(value);
    }

    // productBalance = market.liquidityAvailable**(market.outcomeIds.length);
    // newSharesAvailable = outcome.shares.available.mul(productBalance).div(newProductBalance);
    uint shares = outcome.shares.available - outcome.shares.available.mul(market.liquidityAvailable**(market.outcomeIds.length)).div(newProductBalance);

    require(shares > 0, "Can't be 0");
    require(outcome.shares.available >= shares, "Can't buy more shares than the ones available");

    // new participant, push into the array
    if (market.holdersShares[msg.sender] == 0) {
      market.holders.push(msg.sender);
      market.holdersIndexes[msg.sender] = market.holders.length - 1;
    }

    // doing it for both market and market outcomes
    if (outcome.shares.holdersShares[msg.sender] == 0) {
      outcome.shares.holders.push(msg.sender);
      outcome.shares.holdersIndexes[msg.sender] = market.holders.length - 1;
    }

    outcome.shares.holdersShares[msg.sender] = outcome.shares.holdersShares[msg.sender].add(shares);
    market.holdersShares[msg.sender] = market.holdersShares[msg.sender].add(shares);

    outcome.shares.available = outcome.shares.available.sub(shares);
    market.sharesAvailable = market.sharesAvailable.sub(shares);

    // transaction value is calculated differently if parent action is not buy
    if (parentAction != MarketAction.buy) {
      value = shares.mul(getMarketOutcomePrice(marketId, outcomeId)).div(ONE);
    }

    emit ParticipantAction(msg.sender, MarketAction.buy, marketId, outcomeId, shares, value, now);
    emitMarketOutcomePriceEvents(marketId);
  }

  /// Sell shares of a market outcome
  function sell(uint marketId, uint outcomeId, uint shares) public payable
    timeTransitions(marketId)
    atState(marketId, MarketState.open)
    participantHasShares(marketId, outcomeId, msg.sender)
  {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    // Invariant check: make sure the stake is <= than user's stake
    require(myShares(marketId, outcomeId) >= shares);

    // Invariant check: make sure the market's stake is smaller than the stake
    require((outcome.shares.total - outcome.shares.available) >= shares);

    // removing shares
    outcome.shares.holdersShares[msg.sender] = outcome.shares.holdersShares[msg.sender].sub(shares);
    market.holdersShares[msg.sender] = market.holdersShares[msg.sender].sub(shares);

    // removing participant from participants list
    if (market.holdersShares[msg.sender] == 0) {
      uint index = market.holdersIndexes[msg.sender];
      require(index < market.holders.length);
      market.holders[index] = market.holders[market.holders.length-1];
      market.holders.length--;
    }

    // doing it for both market and market outcomes
    if (outcome.shares.holdersShares[msg.sender] == 0) {
      uint index = outcome.shares.holdersIndexes[msg.sender];
      require(index < outcome.shares.holders.length);
      outcome.shares.holders[index] = outcome.shares.holders[outcome.shares.holders.length-1];
      outcome.shares.holders.length--;
    }

    // adding shares back to pool
    outcome.shares.available = outcome.shares.available.add(shares);
    market.sharesAvailable = market.sharesAvailable.add(shares);

    uint oppositeSharesAvailable = market.sharesAvailable.sub(outcome.shares.available);

    // formula to calculate amount user will receive in ETH
    // x = 1/2 (-sqrt(a^2 - 2 a (y + z) + 4 b + (y + z)^2) + a + y + z)
    // x = ETH amount user will receive
    // y = # shares sold
    // z = # selling shares available
    // a = # opposite shares available
    // b = product balance

    // productBalance = market.liquidityAvailable**(market.outcomeIds.length);
    uint value = (oppositeSharesAvailable**2).add((market.liquidityAvailable**(market.outcomeIds.length)).mul(4));
    value = value.add(outcome.shares.available**2);
    value = value.sub(oppositeSharesAvailable.mul(2).mul(outcome.shares.available));
    value = sqrt(value);
    value = oppositeSharesAvailable.add(outcome.shares.available).sub(value);
    value = value.div(2);

    require(value >= 0, "ETH value has to be > 0");

    // Invariant check: make sure the contract has enough balance to be withdrawn from.
    require(address(this).balance >= value);
    require(market.liquidityTotal >= value);

    // Rebalancing market shares
    for (uint i = 0; i < market.outcomeIds.length; i++) {
      MarketOutcome storage marketOutcome = market.outcomes[i];

      marketOutcome.shares.available = marketOutcome.shares.available.sub(value);
      marketOutcome.shares.total = marketOutcome.shares.total.sub(value);

      // only adding to market total shares, the available remains
      market.sharesTotal = market.sharesTotal.sub(value);
      market.sharesAvailable = market.sharesAvailable.sub(value);
    }

    market.liquidityTotal = market.liquidityTotal.sub(value);

    // subtracting fee from transaction value
    value = addTransactionToFeesPool(marketId, value);

    // 3. Interaction
    msg.sender.transfer(value);

    emit ParticipantAction(msg.sender, MarketAction.sell, marketId, outcomeId, shares, value, now);
    emitMarketOutcomePriceEvents(marketId);
  }

  function addLiquidity(uint marketId) public payable
    timeTransitions(marketId)
    atState(marketId, MarketState.open)
  {
    Market storage market = markets[marketId];

    require(msg.value > 0, "The stake has to be greater than 0.");

    // part of the liquidity is exchanged for outcome shares if not 50-50 market
    // getting liquidity ratio
    uint minShares = MAX_UINT_256;
    uint minOutcomeId;
    uint value;

    for (uint i = 0; i < market.outcomeIds.length; i++) {
      uint outcomeId = market.outcomeIds[i];
      MarketOutcome storage outcome = market.outcomes[outcomeId];

      if (outcome.shares.available < minShares) {
        minShares = outcome.shares.available;
        minOutcomeId = outcomeId;
      }
    }

    uint liquidityRatio = minShares.mul(msg.value).div(market.liquidityAvailable);

    // re-balancing fees pool
    rebalanceFeesPool(marketId, liquidityRatio, MarketAction.addLiquidity);

    market.liquidityAvailable = market.liquidityAvailable.add(liquidityRatio);

    // adding liquidity tokens to market creator
    if (market.liquidityShares[msg.sender] == 0) {
      market.liquidityHolders.push(msg.sender);
      market.liquidityIndexes[msg.sender] = market.liquidityHolders.length - 1;
    }

    market.liquidityShares[msg.sender] = market.liquidityShares[msg.sender].add(liquidityRatio);

    // equal outcome split, no need to buy shares
    if (liquidityRatio == msg.value) {
      market.liquidityTotal = market.liquidityTotal.add(liquidityRatio);
      for (uint i = 0; i < market.outcomeIds.length; i++) {
        uint outcomeId = market.outcomeIds[i];
        MarketOutcome storage outcome = market.outcomes[outcomeId];

        outcome.shares.available = outcome.shares.available.add(liquidityRatio);
        outcome.shares.total = outcome.shares.total.add(liquidityRatio);

        market.sharesTotal = market.sharesTotal.add(liquidityRatio);
        market.sharesAvailable = market.sharesAvailable.add(liquidityRatio);
        value = msg.value;
      }
    } else {
      buy(marketId, minOutcomeId, msg.value, MarketAction.addLiquidity);
      value = liquidityRatio.mul(getMarketLiquidityPrice(marketId)).div(ONE);
    }

    emit ParticipantAction(msg.sender, MarketAction.addLiquidity, marketId, 0, liquidityRatio, value, now);
    emit MarketLiquidity(marketId, market.liquidityAvailable, getMarketLiquidityPrice(marketId), now);
  }

  function removeLiquidity(uint marketId, uint shares) public payable
    timeTransitions(marketId)
    participantHasLiquidity(marketId, msg.sender)
    atState(marketId, MarketState.open)
  {
    Market storage market = markets[marketId];

    // Invariant check: make sure the stake is <= than user's stake
    require(myLiquidityShares(marketId) >= shares);

    // ETH to transfer to user from liquidity removal
    uint value;

    // claiming any pending fees
    claimFees(marketId);

    // removing liquidity tokens from market creator
    market.liquidityShares[msg.sender] = market.liquidityShares[msg.sender].sub(shares);

    if (market.liquidityShares[msg.sender] == 0) {
      uint index = market.liquidityIndexes[msg.sender];
      require(index < market.liquidityHolders.length);
      market.liquidityHolders[index] = market.liquidityHolders[market.liquidityHolders.length-1];
      market.liquidityHolders.length--;
    }

    // part of the liquidity is exchanged for outcome shares if not 50-50 market
    // getting liquidity ratio
    uint minShares = MAX_UINT_256;
    uint minOutcomeId;

    for (uint i = 0; i < market.outcomeIds.length; i++) {
      uint outcomeId = market.outcomeIds[i];
      MarketOutcome storage outcome = market.outcomes[outcomeId];

      if (outcome.shares.available < minShares) {
        minShares = outcome.shares.available;
        minOutcomeId = outcomeId;
      }
    }

    uint liquidityRatio = minShares.mul(shares).div(market.liquidityAvailable);

    // re-balancing fees pool
    rebalanceFeesPool(marketId, shares, MarketAction.removeLiquidity);

    // equal outcome split, no need to buy shares
    if (liquidityRatio == shares) {
      // removing liquidity from market
      market.liquidityTotal = market.liquidityTotal.sub(liquidityRatio);
      market.liquidityAvailable = market.liquidityAvailable.sub(liquidityRatio);

      for (uint i = 0; i < market.outcomeIds.length; i++) {
        uint outcomeId = market.outcomeIds[i];
        MarketOutcome storage outcome = market.outcomes[outcomeId];

        outcome.shares.available = outcome.shares.available.sub(liquidityRatio);
        outcome.shares.total = outcome.shares.total.sub(liquidityRatio);

        market.sharesTotal = market.sharesTotal.sub(liquidityRatio);
        market.sharesAvailable = market.sharesAvailable.sub(liquidityRatio);
      }

      value = shares;
    } else {
      // buying shares from the opposite markets
      uint outcomeId = minOutcomeId == 0 ? 1 : 0;

      // value received: Total Liquidity / Shares Outcome * Liquidity Removed
      value = market.liquidityAvailable.mul(shares).div(market.outcomes[outcomeId].shares.available);

      // removing liquidity from market (shares = value)
      market.liquidityAvailable = market.liquidityAvailable.sub(shares);

      buy(marketId, outcomeId, value, MarketAction.removeLiquidity);
      // msg.sender.transfer(value);
    }

    // transferring user ETH from liquidity removed
    msg.sender.transfer(value);

    emit ParticipantAction(msg.sender, MarketAction.removeLiquidity, marketId, 0, shares, value, now);
    emit MarketLiquidity(marketId, market.liquidityAvailable, getMarketLiquidityPrice(marketId), now);
  }

  /// Determine the result of the market
  /// @dev Only allowed by oracle
  /// @return Id of the outcome
  function resolveMarketOutcome(uint marketId, uint outcomeId) public
    timeTransitions(marketId)
    atState(marketId, MarketState.closed)
    transitionNext(marketId)
    returns(uint)
  {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    // assuring action is performed by oracle
    require(market.oracle == msg.sender, "Market resolution needs to be performed by oracle");
    require(market.resolvedOutcomeId == MAX_UINT_256, "Market already resolved");

    // assuring outcome is valid
    require(outcome.marketId == marketId, "Market is not valid");

    market.resolvedOutcomeId = outcomeId;
    emit MarketResolved(market.oracle, marketId, outcomeId);
    // emitting 1 price event for winner outcome
    emit MarketOutcomePrice(marketId, outcomeId, ONE, now);
    // emitting 0 price event for loser outcome
    emit MarketOutcomePrice(marketId, (outcomeId == 0 ? 1 : 0), 0, now);
    // final liquidity price = outcome shares / liquidity shares
    uint liquidityPrice = outcome.shares.available.mul(ONE).div(market.liquidityAvailable);
    emit MarketLiquidity(marketId, market.liquidityAvailable, liquidityPrice, now);

    return market.resolvedOutcomeId;
  }

  /// Allowing holders of resolved outcome shares to claim earnings.
  function claimWinnings(uint marketId) public
    atState(marketId, MarketState.resolved)
  {
    Market storage market = markets[marketId];
    MarketOutcome storage resolvedOutcome = market.outcomes[market.resolvedOutcomeId];

    require(resolvedOutcome.shares.holdersShares[msg.sender] > 0, "Participant does not hold resolved outcome shares");
    require(resolvedOutcome.shares.holdersClaims[msg.sender] == false, "Participant already claimed resolved outcome winnings");

    // 1 share = 1 ETH
    uint value = resolvedOutcome.shares.holdersShares[msg.sender];

    // assuring market has enough funds
    require(market.liquidityTotal >= value, "Market does not have enough balance");

    market.liquidityTotal = market.liquidityTotal.sub(value);
    resolvedOutcome.shares.holdersClaims[msg.sender] = true;

    emit ParticipantAction(
      msg.sender,
      MarketAction.claimWinnings,
      marketId,
      market.resolvedOutcomeId,
      resolvedOutcome.shares.holdersShares[msg.sender],
      value,
      now
    );

    msg.sender.transfer(value);
  }

  /// Allowing liquidity providers to claim earnings from liquidity providing.
  function claimLiquidity(uint marketId) public
    atState(marketId, MarketState.resolved)
  {
    Market storage market = markets[marketId];
    MarketOutcome storage resolvedOutcome = market.outcomes[market.resolvedOutcomeId];

    // claiming any pending fees
    claimFees(marketId);

    require(market.liquidityShares[msg.sender] > 0, "Participant does not hold liquidity shares");
    require(market.liquidityClaims[msg.sender] == false, "Participant already claimed liquidity winnings");

    // value = total resolved outcome pool shares * pool share (%)
    uint value = resolvedOutcome.shares.available.mul(myLiquidityPoolShare(marketId)).div(ONE);

    // assuring market has enough funds
    require(market.liquidityTotal >= value, "Market does not have enough balance");

    market.liquidityTotal = market.liquidityTotal.sub(value);
    market.liquidityClaims[msg.sender] = true;

    emit ParticipantAction(
      msg.sender,
      MarketAction.claimLiquidity,
      marketId,
      0,
      market.liquidityShares[msg.sender],
      value,
      now
    );

    msg.sender.transfer(value);
  }

  function claimFees(uint marketId) public payable {
    Market storage market = markets[marketId];

    uint claimableFees = getUserClaimableFees(marketId, msg.sender);

    if (claimableFees > 0) {
      market.feesClaimed[msg.sender] = market.feesClaimed[msg.sender].add(claimableFees);
      msg.sender.transfer(claimableFees);
    }
  }

  function addTransactionToFeesPool(uint marketId, uint value) internal returns(uint) {
    Market storage market = markets[marketId];
    uint feeAmount = value.mul(market.fee) / ONE;

    market.feePoolWeight = market.feePoolWeight.add(feeAmount);

    // returning investment minus fees
    return value.sub(feeAmount);
  }

  function rebalanceFeesPool(uint marketId, uint liquidityShares, MarketAction action) internal returns (uint) {
    Market storage market = markets[marketId];

    uint feePoolWeight = liquidityShares.mul(market.feePoolWeight).div(market.liquidityAvailable);

    if (action == MarketAction.addLiquidity) {
      market.feePoolWeight = market.feePoolWeight.add(feePoolWeight);
      market.feesClaimed[msg.sender] = market.feesClaimed[msg.sender].add(feePoolWeight);
    } else {
      market.feePoolWeight = market.feePoolWeight.sub(feePoolWeight);
      market.feesClaimed[msg.sender] = market.feesClaimed[msg.sender].sub(feePoolWeight);
    }
  }

  /// Internal function for advancing the market state.
  function nextState(uint marketId) internal {
    Market storage market = markets[marketId];
    market.state = MarketState(uint(market.state) + 1);
  }

  function emitMarketOutcomePriceEvents(
    uint marketId
  ) internal {
    Market storage market = markets[marketId];

    for (uint i = 0; i < market.outcomeIds.length; i++) {
      emit MarketOutcomePrice(marketId, i, getMarketOutcomePrice(marketId, i), now);
    }

    // liquidity shares also change value
    emit MarketLiquidity(marketId, market.liquidityAvailable, getMarketLiquidityPrice(marketId), now);
  }

  // ------ Core Functions End ------

  // ------ Governance Functions Start ------

  function updateFee(uint feeValue) public
    onlyOwner()
  {
    fee = feeValue;
  }

  // ------ Governance Functions End ------

  // ------ Getters ------

  /// @return stake of the `msg.sender` in the market outcome
  function myShares(uint marketId, uint outcomeId) public view returns(uint) {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    return outcome.shares.holdersShares[msg.sender];
  }

  // @return liquidity stake of the `msg.sender` in the market
  function myLiquidityShares(uint marketId) public view returns(uint) {
    Market storage market = markets[marketId];

    return market.liquidityShares[msg.sender];
  }

  // @return % of liquidity pool stake
  function myLiquidityPoolShare(uint marketId) public view returns(uint) {
    Market storage market = markets[marketId];

    return market.liquidityShares[msg.sender].mul(ONE).div(market.liquidityAvailable);
  }

  function myMarketShares(uint marketId)
    public view
    returns(
      uint,
      uint,
      uint
    )
  {
    return getUserMarketShares(marketId, msg.sender);
  }

  function myClaimStatus(uint marketId)
    public view
    returns(
      bool,
      bool,
      bool,
      bool
    )
  {
    return getUserClaimStatus(marketId, msg.sender);
  }

  function getUserMarketShares(uint marketId, address participant)
    public view
    returns(
      uint,
      uint,
      uint
    )
  {
    Market storage market = markets[marketId];

    return (
      market.liquidityShares[participant],
      market.outcomes[0].shares.holdersShares[participant],
      market.outcomes[1].shares.holdersShares[participant]
    );
  }

  function getUserClaimStatus(uint marketId, address participant)
    public view
    returns(
      bool,
      bool,
      bool,
      bool
    )
  {
    Market storage market = markets[marketId];
    // market still not resolved
    if (market.state != MarketState.resolved) {
      return (false, false, false, false);
    }

    MarketOutcome storage outcome = market.outcomes[market.resolvedOutcomeId];

    return (
      outcome.shares.holdersShares[participant] > 0,
      outcome.shares.holdersClaims[participant],
      market.liquidityShares[participant] > 0,
      market.liquidityClaims[participant]
    );
  }

  function getUserClaimableFees(uint marketId, address participant)
    public view
    returns(uint)
  {
    Market storage market = markets[marketId];

    uint rawAmount = market.feePoolWeight.mul(market.liquidityShares[participant]).div(market.liquidityAvailable);
    return rawAmount.sub(market.feesClaimed[participant]);
  }

  /// Allow retrieving the the array of created contracts
  /// @return An array of all created Market contracts
  function getMarkets() public view returns(uint[] memory) {
    return marketIds;
  }

  function getMarketData(uint marketId)
    public view
    returns(
      string memory,
      MarketState,
      uint,
      uint,
      uint,
      uint,
      int
    )
  {
    Market storage market = markets[marketId];

    return (
      market.name,
      market.state,
      market.closedDateTime,
      market.liquidityAvailable,
      market.liquidityTotal,
      market.sharesAvailable,
      getMarketResolvedOutcome(marketId)
    );
  }


  function getMarketPrices(uint marketId)
    public view
    returns(
      uint,
      uint,
      uint
    )
  {
    return (
      getMarketLiquidityPrice(marketId),
      getMarketOutcomePrice(marketId, 0),
      getMarketOutcomePrice(marketId, 1)
    );
  }

  function getMarketLiquidityPrice(uint marketId) public view returns(uint) {
    Market storage market = markets[marketId];

    if (market.state == MarketState.resolved) {
      // resolved market, price is either 0 or 1
      // final liquidity price = outcome shares / liquidity shares
      return market.outcomes[market.resolvedOutcomeId].shares.available.mul(ONE).div(market.liquidityAvailable);
    }

    // liquidity price = # liquidity shares / # outcome shares * # outcomes
    return market.liquidityAvailable.mul(ONE * market.outcomeIds.length).div(market.sharesAvailable);
  }

  function getMarketResolvedOutcome(uint marketId) public view returns(int) {
    Market storage market = markets[marketId];

    // returning -1 if market still not resolved
    if (market.state != MarketState.resolved) {
      return -1;
    }

    return int(market.resolvedOutcomeId);
  }

  // ------ Outcome Getters ------

  function getMarketOutcomeIds(uint marketId) public view returns(uint[] memory) {
    Market storage market = markets[marketId];
    return market.outcomeIds;
  }

  function getMarketOutcomePrice(uint marketId, uint marketOutcomeId) public view returns(uint) {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[marketOutcomeId];

    if (market.state == MarketState.resolved) {
      // resolved market, price is either 0 or 1
      return marketOutcomeId == market.resolvedOutcomeId ? ONE : 0;
    }

    require(outcome.shares.total >= outcome.shares.available, "Total shares has to be equal or higher than available shares");
    require(market.sharesAvailable >= outcome.shares.available, "Total # available shares has to be equal or higher than outcome available shares");

    uint holdersShares = market.sharesAvailable.sub(outcome.shares.available);

    return holdersShares.mul(ONE).div(market.sharesAvailable);
  }

  function getMarketOutcomeData(uint marketId, uint marketOutcomeId)
    public view
    returns(
      string memory,
      uint,
      uint,
      uint
    )
  {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[marketOutcomeId];

    return (
      outcome.name,
      getMarketOutcomePrice(marketId, marketOutcomeId),
      outcome.shares.available,
      outcome.shares.total
    );
  }

  // ------ Getters ------

  // TODO: move to library
  // fetched from uniswap: https://github.com/Uniswap/uniswap-v2-core/blob/v1.0.1/contracts/libraries/Math.sol
  // babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
  function sqrt(uint y) internal pure returns (uint z) {
    if (y > 3) {
      z = y;
      uint x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }
}
