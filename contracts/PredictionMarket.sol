pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./RealitioERC20.sol";

// openzeppelin imports
import "@openzeppelin/contracts/math/SafeMath.sol";

library CeilDiv {
  // calculates ceil(x/y)
  function ceildiv(uint256 x, uint256 y) internal pure returns (uint256) {
    if (x > 0) return ((x - 1) / y) + 1;
    return x / y;
  }
}

/// @title Market Contract Factory
contract PredictionMarket {
  using SafeMath for uint256;
  using CeilDiv for uint256;

  // ------ Events ------

  event MarketCreated(address indexed user, uint256 indexed marketId, uint256 outcomes, string question, string image);

  event MarketActionTx(
    address indexed user,
    MarketAction indexed action,
    uint256 indexed marketId,
    uint256 outcomeId,
    uint256 shares,
    uint256 value,
    uint256 timestamp
  );

  event MarketOutcomePrice(uint256 indexed marketId, uint256 indexed outcomeId, uint256 value, uint256 timestamp);

  event MarketLiquidity(
    uint256 indexed marketId,
    uint256 value, // total liquidity
    uint256 price, // value of one liquidity share; max: 1 (50-50 situation)
    uint256 timestamp
  );

  event MarketResolved(address indexed user, uint256 indexed marketId, uint256 outcomeId, uint256 timestamp);

  // ------ Events End ------

  uint256 public constant MAX_UINT_256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935;

  uint256 public constant ONE = 10**18;

  enum MarketState {
    open,
    closed,
    resolved
  }
  enum MarketAction {
    buy,
    sell,
    addLiquidity,
    removeLiquidity,
    claimWinnings,
    claimLiquidity,
    claimFees,
    claimVoided
  }

  struct Market {
    // market details
    uint256 closesAtTimestamp;
    uint256 balance; // total stake
    uint256 liquidity; // stake held
    uint256 sharesAvailable; // shares held (all outcomes)
    mapping(address => uint256) liquidityShares;
    mapping(address => bool) liquidityClaims; // wether user has claimed liquidity earnings
    MarketState state; // resolution variables
    MarketResolution resolution; // fees
    MarketFees fees;
    // market outcomes
    uint256[] outcomeIds;
    mapping(uint256 => MarketOutcome) outcomes;
  }

  struct MarketFees {
    uint256 value; // fee % taken from every transaction
    uint256 poolWeight; // internal var used to ensure pro-rate fee distribution
    mapping(address => uint256) claimed;
  }

  struct MarketResolution {
    bool resolved;
    uint256 outcomeId;
    bytes32 questionId; // realitio questionId
  }

  struct MarketOutcome {
    uint256 marketId;
    uint256 id;
    Shares shares;
  }

  struct Shares {
    uint256 total; // number of shares
    uint256 available; // available shares
    mapping(address => uint256) holders;
    mapping(address => bool) claims; // wether user has claimed winnings
    mapping(address => bool) voidedClaims; // wether user has claimed voided market shares
  }

  uint256[] marketIds;
  mapping(uint256 => Market) markets;
  uint256 public marketIndex;

  // governance
  uint256 public fee; // fee % taken from every transaction, can be updated by contract owner
  // realitio configs
  address public realitioAddress;
  uint256 public realitioTimeout;
  // market creation
  IERC20 public token; // token used for rewards / market creation
  uint256 public requiredBalance; // required balance for market creation

  // ------ Modifiers ------

  modifier isMarket(uint256 marketId) {
    require(marketId < marketIndex);
    _;
  }

  modifier timeTransitions(uint256 marketId) {
    if (now > markets[marketId].closesAtTimestamp && markets[marketId].state == MarketState.open) {
      nextState(marketId);
    }
    _;
  }

  modifier atState(uint256 marketId, MarketState state) {
    require(markets[marketId].state == state);
    _;
  }

  modifier notAtState(uint256 marketId, MarketState state) {
    require(markets[marketId].state != state);
    _;
  }

  modifier transitionNext(uint256 marketId) {
    _;
    nextState(marketId);
  }

  modifier mustHoldRequiredBalance() {
    require(token.balanceOf(msg.sender) >= requiredBalance, "msg.sender must hold minimum erc20 balance");
    _;
  }

  // ------ Modifiers End ------

  /// @dev protocol is immutable and has no ownership
  constructor(
    uint256 _fee,
    IERC20 _token,
    uint256 _requiredBalance,
    address _realitioAddress,
    uint256 _realitioTimeout
  ) public {
    require(_realitioAddress != address(0), "_realitioAddress is address 0");
    fee = _fee;
    token = _token;
    requiredBalance = _requiredBalance;
    realitioAddress = _realitioAddress;
    realitioTimeout = _realitioTimeout;
  }

  // ------ Core Functions ------

  /// @dev Creates a market, initializes the outcome shares pool and submits a question in Realitio
  function createMarket(
    string calldata question,
    string calldata image,
    uint256 closesAt,
    address arbitrator,
    uint256 outcomes
  ) external payable mustHoldRequiredBalance() returns (uint256) {
    uint256 marketId = marketIndex;
    marketIds.push(marketId);

    Market storage market = markets[marketId];

    require(msg.value > 0, "stake needs to be > 0");
    require(closesAt >= now, "market must resolve after the current date");
    require(arbitrator == address(arbitrator), "invalid arbitrator address");
    // v1 - only binary markets
    require(outcomes == 2, "number of outcomes has to be 2");

    market.closesAtTimestamp = closesAt;
    market.state = MarketState.open;
    market.fees.value = fee;
    // setting intial value to an integer that does not map to any outcomeId
    market.resolution.outcomeId = MAX_UINT_256;

    // creating market outcomes
    for (uint256 i = 0; i < outcomes; i++) {
      market.outcomeIds.push(i);
      MarketOutcome storage outcome = market.outcomes[i];

      outcome.marketId = marketId;
      outcome.id = i;
    }

    // creating question in realitio
    RealitioERC20 realitio = RealitioERC20(realitioAddress);

    market.resolution.questionId = realitio.askQuestionERC20(
      2,
      question,
      arbitrator,
      uint32(realitioTimeout),
      uint32(closesAt),
      0,
      0
    );

    addLiquidity(marketId, msg.value);

    // emiting initial price events
    emitMarketOutcomePriceEvents(marketId);
    emit MarketCreated(msg.sender, marketId, outcomes, question, image);

    // incrementing market array index
    marketIndex = marketIndex + 1;

    return marketId;
  }

  /// @dev Calculates the number of shares bought with "amount" balance
  function calcBuyAmount(
    uint256 amount,
    uint256 marketId,
    uint256 outcomeId
  ) public view returns (uint256) {
    Market storage market = markets[marketId];

    uint256[] memory outcomesShares = getMarketOutcomesShares(marketId);
    uint256 amountMinusFees = amount.sub(amount.mul(market.fees.value) / ONE);
    uint256 buyTokenPoolBalance = outcomesShares[outcomeId];
    uint256 endingOutcomeBalance = buyTokenPoolBalance.mul(ONE);
    for (uint256 i = 0; i < outcomesShares.length; i++) {
      if (i != outcomeId) {
        uint256 outcomeShares = outcomesShares[i];
        endingOutcomeBalance = endingOutcomeBalance.mul(outcomeShares).ceildiv(outcomeShares.add(amountMinusFees));
      }
    }
    require(endingOutcomeBalance > 0, "must have non-zero balances");

    return buyTokenPoolBalance.add(amountMinusFees).sub(endingOutcomeBalance.ceildiv(ONE));
  }

  /// @dev Calculates the number of shares needed to be sold in order to receive "amount" in balance
  function calcSellAmount(
    uint256 amount,
    uint256 marketId,
    uint256 outcomeId
  ) public view returns (uint256 outcomeTokenSellAmount) {
    Market storage market = markets[marketId];

    uint256[] memory outcomesShares = getMarketOutcomesShares(marketId);
    uint256 amountPlusFees = amount.mul(ONE) / ONE.sub(market.fees.value);
    uint256 sellTokenPoolBalance = outcomesShares[outcomeId];
    uint256 endingOutcomeBalance = sellTokenPoolBalance.mul(ONE);
    for (uint256 i = 0; i < outcomesShares.length; i++) {
      if (i != outcomeId) {
        uint256 outcomeShares = outcomesShares[i];
        endingOutcomeBalance = endingOutcomeBalance.mul(outcomeShares).ceildiv(outcomeShares.sub(amountPlusFees));
      }
    }
    require(endingOutcomeBalance > 0, "must have non-zero balances");

    return amountPlusFees.add(endingOutcomeBalance.ceildiv(ONE)).sub(sellTokenPoolBalance);
  }

  /// @dev Buy shares of a market outcome
  function buy(
    uint256 marketId,
    uint256 outcomeId,
    uint256 minOutcomeSharesToBuy
  ) external payable timeTransitions(marketId) atState(marketId, MarketState.open) {
    Market storage market = markets[marketId];

    uint256 value = msg.value;
    uint256 shares = calcBuyAmount(value, marketId, outcomeId);
    require(shares >= minOutcomeSharesToBuy, "minimum buy amount not reached");

    // subtracting fee from transaction value
    uint256 feeAmount = value.mul(market.fees.value) / ONE;
    market.fees.poolWeight = market.fees.poolWeight.add(feeAmount);
    uint256 valueMinusFees = value.sub(feeAmount);

    MarketOutcome storage outcome = market.outcomes[outcomeId];

    // Funding market shares with received funds
    addSharesToMarket(marketId, valueMinusFees);

    require(outcome.shares.available >= shares, "outcome shares pool balance is too low");

    transferOutcomeSharesfromPool(msg.sender, marketId, outcomeId, shares);

    emit MarketActionTx(msg.sender, MarketAction.buy, marketId, outcomeId, shares, value, now);
    emitMarketOutcomePriceEvents(marketId);
  }

  /// @dev Sell shares of a market outcome
  function sell(
    uint256 marketId,
    uint256 outcomeId,
    uint256 value,
    uint256 maxOutcomeSharesToSell
  ) external payable timeTransitions(marketId) atState(marketId, MarketState.open) {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    uint256 shares = calcSellAmount(value, marketId, outcomeId);

    require(shares <= maxOutcomeSharesToSell, "maximum sell amount exceeded");
    require(outcome.shares.holders[msg.sender] >= shares, "user does not have enough balance");

    transferOutcomeSharesToPool(msg.sender, marketId, outcomeId, shares);

    // adding fee to transaction value
    uint256 feeAmount = value.mul(market.fees.value) / (ONE.sub(fee));
    market.fees.poolWeight = market.fees.poolWeight.add(feeAmount);
    uint256 valuePlusFees = value.add(feeAmount);

    require(market.balance >= valuePlusFees, "market does not have enough balance");

    // Rebalancing market shares
    removeSharesFromMarket(marketId, valuePlusFees);

    // Transferring funds to user
    msg.sender.transfer(value);

    emit MarketActionTx(msg.sender, MarketAction.sell, marketId, outcomeId, shares, value, now);
    emitMarketOutcomePriceEvents(marketId);
  }

  /// @dev Adds liquidity to a market - external
  function addLiquidity(uint256 marketId)
    external
    payable
    timeTransitions(marketId)
    atState(marketId, MarketState.open)
  {
    addLiquidity(marketId, msg.value);
  }

  /// @dev Private function, used by addLiquidity and CreateMarket
  function addLiquidity(uint256 marketId, uint256 value)
    private
    timeTransitions(marketId)
    atState(marketId, MarketState.open)
  {
    Market storage market = markets[marketId];

    require(value > 0, "stake has to be greater than 0.");

    uint256 liquidityAmount;

    uint256[] memory outcomesShares = getMarketOutcomesShares(marketId);
    uint256[] memory sendBackAmounts = new uint256[](outcomesShares.length);
    uint256 poolWeight = 0;

    if (market.liquidity > 0) {
      // part of the liquidity is exchanged for outcome shares if market is not balanced
      for (uint256 i = 0; i < outcomesShares.length; i++) {
        uint256 outcomeShares = outcomesShares[i];
        if (poolWeight < outcomeShares) poolWeight = outcomeShares;
      }

      for (uint256 i = 0; i < outcomesShares.length; i++) {
        uint256 remaining = value.mul(outcomesShares[i]) / poolWeight;
        sendBackAmounts[i] = value.sub(remaining);
      }

      liquidityAmount = value.mul(market.liquidity) / poolWeight;

      // re-balancing fees pool
      rebalanceFeesPool(marketId, liquidityAmount, MarketAction.addLiquidity);
    } else {
      // funding market with no liquidity
      liquidityAmount = value;
    }

    // funding market
    market.liquidity = market.liquidity.add(liquidityAmount);
    market.liquidityShares[msg.sender] = market.liquidityShares[msg.sender].add(liquidityAmount);

    addSharesToMarket(marketId, value);

    // transform sendBackAmounts to array of amounts added
    for (uint256 i = 0; i < sendBackAmounts.length; i++) {
      if (sendBackAmounts[i] > 0) {
        uint256 marketShares = market.sharesAvailable;
        uint256 outcomeShares = market.outcomes[i].shares.available;
        transferOutcomeSharesfromPool(msg.sender, marketId, i, sendBackAmounts[i]);
        emit MarketActionTx(
          msg.sender,
          MarketAction.buy,
          marketId,
          i,
          sendBackAmounts[i],
          (marketShares.sub(outcomeShares)).mul(sendBackAmounts[i]).div(market.sharesAvailable), // price * shares
          now
        );
      }
    }

    uint256 liquidityPrice = getMarketLiquidityPrice(marketId);
    uint256 liquidityValue = liquidityPrice.mul(liquidityAmount) / ONE;
    emit MarketActionTx(msg.sender, MarketAction.addLiquidity, marketId, 0, liquidityAmount, liquidityValue, now);
    emit MarketLiquidity(marketId, market.liquidity, liquidityPrice, now);
  }

  /// @dev Removes liquidity to a market - external
  function removeLiquidity(uint256 marketId, uint256 shares)
    external
    payable
    timeTransitions(marketId)
    atState(marketId, MarketState.open)
  {
    Market storage market = markets[marketId];

    require(market.liquidityShares[msg.sender] >= shares, "user does not have enough balance");
    // claiming any pending fees
    claimFees(marketId);

    // re-balancing fees pool
    rebalanceFeesPool(marketId, shares, MarketAction.removeLiquidity);

    uint256[] memory outcomesShares = getMarketOutcomesShares(marketId);
    uint256[] memory sendAmounts = new uint256[](outcomesShares.length);
    uint256 poolWeight = MAX_UINT_256;

    // part of the liquidity is exchanged for outcome shares if market is not balanced
    for (uint256 i = 0; i < outcomesShares.length; i++) {
      uint256 outcomeShares = outcomesShares[i];
      if (poolWeight > outcomeShares) poolWeight = outcomeShares;
    }

    uint256 liquidityAmount = shares.mul(poolWeight).div(market.liquidity);

    for (uint256 i = 0; i < outcomesShares.length; i++) {
      sendAmounts[i] = outcomesShares[i].mul(shares) / market.liquidity;
      sendAmounts[i] = sendAmounts[i].sub(liquidityAmount);
    }

    // removing liquidity from market
    removeSharesFromMarket(marketId, liquidityAmount);
    market.liquidity = market.liquidity.sub(shares);
    // removing liquidity tokens from market creator
    market.liquidityShares[msg.sender] = market.liquidityShares[msg.sender].sub(shares);

    for (uint256 i = 0; i < outcomesShares.length; i++) {
      if (sendAmounts[i] > 0) {
        uint256 marketShares = market.sharesAvailable;
        uint256 outcomeShares = market.outcomes[i].shares.available;

        transferOutcomeSharesfromPool(msg.sender, marketId, i, sendAmounts[i]);
        emit MarketActionTx(
          msg.sender,
          MarketAction.buy,
          marketId,
          i,
          sendAmounts[i],
          (marketShares.sub(outcomeShares)).mul(sendAmounts[i]).div(market.sharesAvailable), // price * shares
          now
        );
      }
    }

    // transferring user funds from liquidity removed
    msg.sender.transfer(liquidityAmount);

    emit MarketActionTx(msg.sender, MarketAction.removeLiquidity, marketId, 0, shares, liquidityAmount, now);
    emit MarketLiquidity(marketId, market.liquidity, getMarketLiquidityPrice(marketId), now);
  }

  /// @dev Fetches winning outcome from Realitio and resolves the market
  function resolveMarketOutcome(uint256 marketId)
    external
    timeTransitions(marketId)
    atState(marketId, MarketState.closed)
    transitionNext(marketId)
    returns (uint256)
  {
    Market storage market = markets[marketId];

    RealitioERC20 realitio = RealitioERC20(realitioAddress);
    // will fail if question is not finalized
    uint256 outcomeId = uint256(realitio.resultFor(market.resolution.questionId));

    market.resolution.outcomeId = outcomeId;

    emit MarketResolved(msg.sender, marketId, outcomeId, now);
    emitMarketOutcomePriceEvents(marketId);

    return market.resolution.outcomeId;
  }

  /// @dev Allows holders of resolved outcome shares to claim earnings.
  function claimWinnings(uint256 marketId) external atState(marketId, MarketState.resolved) {
    Market storage market = markets[marketId];
    MarketOutcome storage resolvedOutcome = market.outcomes[market.resolution.outcomeId];

    require(resolvedOutcome.shares.holders[msg.sender] > 0, "user does not hold resolved outcome shares");
    require(resolvedOutcome.shares.claims[msg.sender] == false, "user already claimed resolved outcome winnings");

    // 1 share => price = 1
    uint256 value = resolvedOutcome.shares.holders[msg.sender];

    // assuring market has enough funds
    require(market.balance >= value, "Market does not have enough balance");

    market.balance = market.balance.sub(value);
    resolvedOutcome.shares.claims[msg.sender] = true;

    emit MarketActionTx(
      msg.sender,
      MarketAction.claimWinnings,
      marketId,
      market.resolution.outcomeId,
      resolvedOutcome.shares.holders[msg.sender],
      value,
      now
    );

    msg.sender.transfer(value);
  }

  /// @dev Allows holders of voided outcome shares to claim balance back.
  function claimVoidedOutcomeShares(uint256 marketId, uint256 outcomeId)
    external
    atState(marketId, MarketState.resolved)
  {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    require(outcome.shares.holders[msg.sender] > 0, "user does not hold outcome shares");
    require(outcome.shares.voidedClaims[msg.sender] == false, "user already claimed outcome shares");

    // voided market - shares are valued at last market price
    uint256 price = getMarketOutcomePrice(marketId, outcomeId);
    uint256 value = price.mul(outcome.shares.holders[msg.sender]).div(ONE);

    // assuring market has enough funds
    require(market.balance >= value, "Market does not have enough balance");

    market.balance = market.balance.sub(value);
    outcome.shares.voidedClaims[msg.sender] = true;

    emit MarketActionTx(
      msg.sender,
      MarketAction.claimVoided,
      marketId,
      outcomeId,
      outcome.shares.holders[msg.sender],
      value,
      now
    );

    msg.sender.transfer(value);
  }

  /// @dev Allows liquidity providers to claim earnings from liquidity providing.
  function claimLiquidity(uint256 marketId) external atState(marketId, MarketState.resolved) {
    Market storage market = markets[marketId];

    // claiming any pending fees
    claimFees(marketId);

    require(market.liquidityShares[msg.sender] > 0, "user does not hold liquidity shares");
    require(market.liquidityClaims[msg.sender] == false, "user already claimed liquidity winnings");

    // value = total resolved outcome pool shares * pool share (%)
    uint256 liquidityPrice = getMarketLiquidityPrice(marketId);
    uint256 value = liquidityPrice.mul(market.liquidityShares[msg.sender]) / ONE;

    // assuring market has enough funds
    require(market.balance >= value, "Market does not have enough balance");

    market.balance = market.balance.sub(value);
    market.liquidityClaims[msg.sender] = true;

    emit MarketActionTx(
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

  /// @dev Allows liquidity providers to claim their fees share from fees pool
  function claimFees(uint256 marketId) public payable {
    Market storage market = markets[marketId];

    uint256 claimableFees = getUserClaimableFees(marketId, msg.sender);

    if (claimableFees > 0) {
      market.fees.claimed[msg.sender] = market.fees.claimed[msg.sender].add(claimableFees);
      msg.sender.transfer(claimableFees);
    }

    emit MarketActionTx(
      msg.sender,
      MarketAction.claimFees,
      marketId,
      0,
      market.liquidityShares[msg.sender],
      claimableFees,
      now
    );
  }

  /// @dev Rebalances the fees pool. Needed in every AddLiquidity / RemoveLiquidity call
  function rebalanceFeesPool(
    uint256 marketId,
    uint256 liquidityShares,
    MarketAction action
  ) private returns (uint256) {
    Market storage market = markets[marketId];

    uint256 poolWeight = liquidityShares.mul(market.fees.poolWeight).div(market.liquidity);

    if (action == MarketAction.addLiquidity) {
      market.fees.poolWeight = market.fees.poolWeight.add(poolWeight);
      market.fees.claimed[msg.sender] = market.fees.claimed[msg.sender].add(poolWeight);
    } else {
      market.fees.poolWeight = market.fees.poolWeight.sub(poolWeight);
      market.fees.claimed[msg.sender] = market.fees.claimed[msg.sender].sub(poolWeight);
    }
  }

  /// @dev Transitions market to next state
  function nextState(uint256 marketId) private {
    Market storage market = markets[marketId];
    market.state = MarketState(uint256(market.state) + 1);
    require(marketId <= 2, "Invalid market state");
  }

  /// @dev Emits a outcome price event for every outcome
  function emitMarketOutcomePriceEvents(uint256 marketId) private {
    Market storage market = markets[marketId];

    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
      emit MarketOutcomePrice(marketId, i, getMarketOutcomePrice(marketId, i), now);
    }

    // liquidity shares also change value
    emit MarketLiquidity(marketId, market.liquidity, getMarketLiquidityPrice(marketId), now);
  }

  /// @dev Adds outcome shares to shares pool
  function addSharesToMarket(uint256 marketId, uint256 shares) private {
    Market storage market = markets[marketId];

    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
      MarketOutcome storage outcome = market.outcomes[i];

      outcome.shares.available = outcome.shares.available.add(shares);
      outcome.shares.total = outcome.shares.total.add(shares);

      // only adding to market total shares, the available remains
      market.sharesAvailable = market.sharesAvailable.add(shares);
    }

    market.balance = market.balance.add(shares);
  }

  /// @dev Removes outcome shares from shares pool
  function removeSharesFromMarket(uint256 marketId, uint256 shares) private {
    Market storage market = markets[marketId];

    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
      MarketOutcome storage outcome = market.outcomes[i];

      outcome.shares.available = outcome.shares.available.sub(shares);
      outcome.shares.total = outcome.shares.total.sub(shares);

      // only subtracting from market total shares, the available remains
      market.sharesAvailable = market.sharesAvailable.sub(shares);
    }

    market.balance = market.balance.sub(shares);
  }

  /// @dev Transfer outcome shares from pool to user balance
  function transferOutcomeSharesfromPool(
    address user,
    uint256 marketId,
    uint256 outcomeId,
    uint256 shares
  ) private {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    // transfering shares from shares pool to user
    outcome.shares.holders[user] = outcome.shares.holders[user].add(shares);
    outcome.shares.available = outcome.shares.available.sub(shares);
    market.sharesAvailable = market.sharesAvailable.sub(shares);
  }

  /// @dev Transfer outcome shares from user balance back to pool
  function transferOutcomeSharesToPool(
    address user,
    uint256 marketId,
    uint256 outcomeId,
    uint256 shares
  ) private {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    // adding shares back to pool
    outcome.shares.holders[user] = outcome.shares.holders[user].sub(shares);
    outcome.shares.available = outcome.shares.available.add(shares);
    market.sharesAvailable = market.sharesAvailable.add(shares);
  }

  // ------ Core Functions End ------

  // ------ Getters ------

  function getUserMarketShares(uint256 marketId, address user)
    external
    view
    returns (
      uint256,
      uint256,
      uint256
    )
  {
    Market storage market = markets[marketId];

    return (
      market.liquidityShares[user],
      market.outcomes[0].shares.holders[user],
      market.outcomes[1].shares.holders[user]
    );
  }

  function getUserClaimStatus(uint256 marketId, address user)
    external
    view
    returns (
      bool,
      bool,
      bool,
      bool,
      uint256
    )
  {
    Market storage market = markets[marketId];

    // market still not resolved
    if (market.state != MarketState.resolved) {
      return (false, false, false, false, getUserClaimableFees(marketId, user));
    }

    MarketOutcome storage outcome = market.outcomes[market.resolution.outcomeId];

    return (
      outcome.shares.holders[user] > 0,
      outcome.shares.claims[user],
      market.liquidityShares[user] > 0,
      market.liquidityClaims[user],
      getUserClaimableFees(marketId, user)
    );
  }

  function getUserLiquidityPoolShare(uint256 marketId, address user) external view returns (uint256) {
    Market storage market = markets[marketId];

    return market.liquidityShares[user].mul(ONE).div(market.liquidity);
  }

  function getUserClaimableFees(uint256 marketId, address user) public view returns (uint256) {
    Market storage market = markets[marketId];

    uint256 rawAmount = market.fees.poolWeight.mul(market.liquidityShares[user]).div(market.liquidity);
    return rawAmount.sub(market.fees.claimed[user]);
  }

  function getMarkets() external view returns (uint256[] memory) {
    return marketIds;
  }

  function getMarketData(uint256 marketId)
    external
    view
    returns (
      MarketState,
      uint256,
      uint256,
      uint256,
      uint256,
      int256
    )
  {
    Market storage market = markets[marketId];

    return (
      market.state,
      market.closesAtTimestamp,
      market.liquidity,
      market.balance,
      market.sharesAvailable,
      getMarketResolvedOutcome(marketId)
    );
  }

  function getMarketAltData(uint256 marketId)
    external
    view
    returns (
      uint256,
      bytes32,
      uint256
    )
  {
    Market storage market = markets[marketId];

    return (market.fees.value, market.resolution.questionId, uint256(market.resolution.questionId));
  }

  function getMarketQuestion(uint256 marketId) external view returns (bytes32) {
    Market storage market = markets[marketId];

    return (market.resolution.questionId);
  }

  function getMarketPrices(uint256 marketId)
    external
    view
    returns (
      uint256,
      uint256,
      uint256
    )
  {
    return (getMarketLiquidityPrice(marketId), getMarketOutcomePrice(marketId, 0), getMarketOutcomePrice(marketId, 1));
  }

  function getMarketLiquidityPrice(uint256 marketId) public view returns (uint256) {
    Market storage market = markets[marketId];

    if (market.state == MarketState.resolved && !isMarketVoided(marketId)) {
      // resolved market, price is either 0 or 1
      // final liquidity price = outcome shares / liquidity shares
      return market.outcomes[market.resolution.outcomeId].shares.available.mul(ONE).div(market.liquidity);
    }

    // liquidity price = # liquidity shares / # outcome shares * # outcomes
    return market.liquidity.mul(ONE * market.outcomeIds.length).div(market.sharesAvailable);
  }

  function getMarketResolvedOutcome(uint256 marketId) public view returns (int256) {
    Market storage market = markets[marketId];

    // returning -1 if market still not resolved
    if (market.state != MarketState.resolved) {
      return -1;
    }

    return int256(market.resolution.outcomeId);
  }

  function isMarketVoided(uint256 marketId) public view returns (bool) {
    Market storage market = markets[marketId];

    // market still not resolved, still in valid state
    if (market.state != MarketState.resolved) {
      return false;
    }

    // resolved market id does not match any of the market ids
    return market.resolution.outcomeId >= market.outcomeIds.length;
  }

  // ------ Outcome Getters ------

  function getMarketOutcomeIds(uint256 marketId) external view returns (uint256[] memory) {
    Market storage market = markets[marketId];
    return market.outcomeIds;
  }

  function getMarketOutcomePrice(uint256 marketId, uint256 outcomeId) public view returns (uint256) {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    if (market.state == MarketState.resolved && !isMarketVoided(marketId)) {
      // resolved market, price is either 0 or 1
      return outcomeId == market.resolution.outcomeId ? ONE : 0;
    }

    return (market.sharesAvailable.sub(outcome.shares.available)).mul(ONE).div(market.sharesAvailable);
  }

  function getMarketOutcomeData(uint256 marketId, uint256 outcomeId)
    external
    view
    returns (
      uint256,
      uint256,
      uint256
    )
  {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    return (getMarketOutcomePrice(marketId, outcomeId), outcome.shares.available, outcome.shares.total);
  }

  function getMarketOutcomesShares(uint256 marketId) private view returns (uint256[] memory) {
    Market storage market = markets[marketId];

    uint256[] memory shares = new uint256[](market.outcomeIds.length);
    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
      shares[i] = market.outcomes[i].shares.available;
    }

    return shares;
  }
}
