pragma solidity ^0.6.0;

import "./RealitioERC20.sol";

// openzeppelin imports
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

library PMHelpers {
  // fetched from uniswap: https://github.com/Uniswap/uniswap-v2-core/blob/v1.0.1/contracts/libraries/Math.sol
  // babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
  function sqrt(uint256 y) internal pure returns (uint256 z) {
    if (y > 3) {
      z = y;
      uint256 x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }

  // formats question for realitio
  function formatQuestion(
    string memory name,
    string memory outcome1,
    string memory outcome2
  ) internal pure returns (string memory) {
    return string(abi.encodePacked(name, "␟", '"', outcome1, ",", outcome2, '"␟misc␟en'));
  }
}

/// @title Market Contract Factory
contract PredictionMarket is OwnableUpgradeable {
  using SafeMath for uint256;

  // ------ Events ------

  event ParticipantAction(
    address indexed participant,
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
    uint256 value, // total liquidity (ETH)
    uint256 price, // value of 1 liquidity share; max: 1 ETH (50-50 situation)
    uint256 timestamp
  );

  event MarketResolved(address indexed oracle, uint256 indexed marketId, uint256 outcomeId);

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
    claimLiquidity
  }

  struct Market {
    // market details
    string name;
    uint256 closedDateTime;
    uint256 balance; // total stake (ETH)
    uint256 liquidity; // stake held (ETH)
    uint256 sharesTotal; // total shares (all outcomes)
    uint256 sharesAvailable; // shares held (all outcomes)
    mapping(address => uint256) liquidityShares;
    mapping(address => bool) liquidityClaims; // wether participant has claimed liquidity winnings
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
    address oracle; // TODO remove: deprecated;
    bool resolved;
    uint256 outcomeId;
    bytes32 questionId; // realitio questionId
  }

  struct MarketOutcome {
    uint256 marketId;
    uint256 id;
    string name;
    Shares shares;
  }

  struct Shares {
    uint256 total; // number of shares
    uint256 available; // available shares
    mapping(address => uint256) holders;
    mapping(address => bool) claims; // wether participant has claimed winnings
  }

  uint256[] marketIds;
  mapping(uint256 => Market) markets;
  uint256 public marketIndex;

  // governance
  uint256 public fee; // fee % taken from every transaction, can be updated by contract owner
  // realitio configs
  address public realitioAddress;
  uint256 public realitioTimeout;

  // ------ Modifiers ------

  modifier isMarket(uint256 marketId) {
    require(marketId < marketIndex);
    _;
  }

  modifier timeTransitions(uint256 marketId) {
    if (now > markets[marketId].closedDateTime && markets[marketId].state == MarketState.open) {
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

  modifier participantHasShares(
    uint256 marketId,
    uint256 outcomeId,
    address sender
  ) {
    require(markets[marketId].outcomes[outcomeId].shares.holders[sender] > 0);
    _;
  }

  modifier participantHasLiquidity(uint256 marketId, address sender) {
    require(markets[marketId].liquidityShares[sender] > 0);
    _;
  }

  modifier transitionNext(uint256 marketId) {
    _;
    nextState(marketId);
  }

  // ------ Modifiers End ------

  /// Empty constructor
  constructor() public {}

  // ------ Core Functions ------

  /// Create a new Market contract
  /// @dev The new Market contract is then saved in the array of this contract for future reference.
  /// @param name - Name of the market
  /// @param closesAt - The duration of the market `open` period
  /// @param oracle - oracle address
  function createMarket(
    string memory name,
    uint256 closesAt,
    address oracle,
    string memory outcome1,
    string memory outcome2
  ) public payable returns (uint256) {
    uint256 marketId = marketIndex;
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
    market.resolution.oracle = oracle;
    market.fees.value = fee;
    // setting intial value to an integer that does not map to any outcomeId
    market.resolution.outcomeId = MAX_UINT_256;

    // creating question in realitio
    RealitioERC20 realitio = RealitioERC20(realitioAddress);
    string memory question = PMHelpers.formatQuestion(name, outcome1, outcome2);

    market.resolution.questionId = realitio.askQuestionERC20(
      2,
      question,
      oracle,
      uint32(realitioTimeout),
      uint32(closesAt),
      0,
      0
    );

    market.balance = msg.value;
    market.liquidity = msg.value;

    // TODO review: only valid for 50-50 start
    market.liquidityShares[msg.sender] = market.liquidityShares[msg.sender].add(msg.value);

    // creating market outcomes
    for (uint256 i = 0; i < outcomes.length; i++) {
      market.outcomeIds.push(i);
      MarketOutcome storage outcome = market.outcomes[i];

      outcome.marketId = marketId;
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

  function buy(uint256 marketId, uint256 outcomeId) public payable {
    buy(marketId, outcomeId, msg.value, MarketAction.buy);
  }

  /// Buy shares of a market outcome
  function buy(
    uint256 marketId,
    uint256 outcomeId,
    uint256 value,
    MarketAction parentAction
  ) internal timeTransitions(marketId) atState(marketId, MarketState.open) {
    Market storage market = markets[marketId];

    if (parentAction == MarketAction.buy) {
      // subtracting fee from transaction value
      value = addTransactionToFeesPool(marketId, value);
    }

    MarketOutcome storage outcome = market.outcomes[outcomeId];
    market.balance = parentAction == MarketAction.removeLiquidity
      ? market.balance.sub(value)
      : market.balance.add(value);

    uint256 newProductBalance = 1;

    // Funding market shares with received ETH
    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
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

    // productBalance = market.liquidity**(market.outcomeIds.length);
    // newSharesAvailable = outcome.shares.available.mul(productBalance).div(newProductBalance);
    uint256 shares = outcome.shares.available -
      outcome.shares.available.mul(market.liquidity**(market.outcomeIds.length)).div(newProductBalance);

    require(shares > 0, "Can't be 0");
    require(outcome.shares.available >= shares, "Can't buy more shares than the ones available");

    outcome.shares.holders[msg.sender] = outcome.shares.holders[msg.sender].add(shares);

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
  function sell(
    uint256 marketId,
    uint256 outcomeId,
    uint256 shares
  )
    public
    payable
    timeTransitions(marketId)
    atState(marketId, MarketState.open)
    participantHasShares(marketId, outcomeId, msg.sender)
  {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[outcomeId];

    // Invariant check: make sure the stake is <= than user's stake
    require(outcome.shares.holders[msg.sender] >= shares);

    // Invariant check: make sure the market's stake is smaller than the stake
    require((outcome.shares.total - outcome.shares.available) >= shares);

    // removing shares
    outcome.shares.holders[msg.sender] = outcome.shares.holders[msg.sender].sub(shares);

    // adding shares back to pool
    outcome.shares.available = outcome.shares.available.add(shares);
    market.sharesAvailable = market.sharesAvailable.add(shares);

    uint256 oppositeSharesAvailable = market.sharesAvailable.sub(outcome.shares.available);

    // formula to calculate amount user will receive in ETH
    // x = 1/2 (-sqrt(a^2 - 2 a (y + z) + 4 b + (y + z)^2) + a + y + z)
    // x = ETH amount user will receive
    // y = # shares sold
    // z = # selling shares available
    // a = # opposite shares available
    // b = product balance

    // productBalance = market.liquidity**(market.outcomeIds.length);
    uint256 value = (oppositeSharesAvailable**2).add((market.liquidity**(market.outcomeIds.length)).mul(4));
    value = value.add(outcome.shares.available**2);
    value = value.sub(oppositeSharesAvailable.mul(2).mul(outcome.shares.available));
    value = PMHelpers.sqrt(value);
    value = oppositeSharesAvailable.add(outcome.shares.available).sub(value);
    value = value.div(2);

    require(value >= 0, "ETH value has to be > 0");

    // Invariant check: make sure the contract has enough balance to be withdrawn from.
    require(address(this).balance >= value);
    require(market.balance >= value);

    // Rebalancing market shares
    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
      MarketOutcome storage marketOutcome = market.outcomes[i];

      marketOutcome.shares.available = marketOutcome.shares.available.sub(value);
      marketOutcome.shares.total = marketOutcome.shares.total.sub(value);

      // only adding to market total shares, the available remains
      market.sharesTotal = market.sharesTotal.sub(value);
      market.sharesAvailable = market.sharesAvailable.sub(value);
    }

    market.balance = market.balance.sub(value);

    // subtracting fee from transaction value
    value = addTransactionToFeesPool(marketId, value);

    // 3. Interaction
    msg.sender.transfer(value);

    emit ParticipantAction(msg.sender, MarketAction.sell, marketId, outcomeId, shares, value, now);
    emitMarketOutcomePriceEvents(marketId);
  }

  function addLiquidity(uint256 marketId) public payable timeTransitions(marketId) atState(marketId, MarketState.open) {
    Market storage market = markets[marketId];

    require(msg.value > 0, "The stake has to be greater than 0.");

    // part of the liquidity is exchanged for outcome shares if not 50-50 market
    // getting liquidity ratio
    uint256 minShares = MAX_UINT_256;
    uint256 minOutcomeId;
    uint256 value;

    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
      uint256 outcomeId = market.outcomeIds[i];
      MarketOutcome storage outcome = market.outcomes[outcomeId];

      if (outcome.shares.available < minShares) {
        minShares = outcome.shares.available;
        minOutcomeId = outcomeId;
      }
    }

    uint256 liquidityRatio = minShares.mul(msg.value).div(market.liquidity);

    // re-balancing fees pool
    rebalanceFeesPool(marketId, liquidityRatio, MarketAction.addLiquidity);

    market.liquidity = market.liquidity.add(liquidityRatio);

    market.liquidityShares[msg.sender] = market.liquidityShares[msg.sender].add(liquidityRatio);

    // equal outcome split, no need to buy shares
    if (liquidityRatio == msg.value) {
      market.balance = market.balance.add(liquidityRatio);
      for (uint256 i = 0; i < market.outcomeIds.length; i++) {
        uint256 outcomeId = market.outcomeIds[i];
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
    emit MarketLiquidity(marketId, market.liquidity, getMarketLiquidityPrice(marketId), now);
  }

  function removeLiquidity(uint256 marketId, uint256 shares)
    public
    payable
    timeTransitions(marketId)
    participantHasLiquidity(marketId, msg.sender)
    atState(marketId, MarketState.open)
  {
    Market storage market = markets[marketId];

    // Invariant check: make sure the stake is <= than user's stake
    require(market.liquidityShares[msg.sender] >= shares);

    // ETH to transfer to user from liquidity removal
    uint256 value;

    // claiming any pending fees
    claimFees(marketId);

    // removing liquidity tokens from market creator
    market.liquidityShares[msg.sender] = market.liquidityShares[msg.sender].sub(shares);

    // part of the liquidity is exchanged for outcome shares if not 50-50 market
    // getting liquidity ratio
    uint256 minShares = MAX_UINT_256;
    uint256 minOutcomeId;

    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
      uint256 outcomeId = market.outcomeIds[i];
      MarketOutcome storage outcome = market.outcomes[outcomeId];

      if (outcome.shares.available < minShares) {
        minShares = outcome.shares.available;
        minOutcomeId = outcomeId;
      }
    }

    uint256 liquidityRatio = minShares.mul(shares).div(market.liquidity);

    // re-balancing fees pool
    rebalanceFeesPool(marketId, shares, MarketAction.removeLiquidity);

    // equal outcome split, no need to buy shares
    if (liquidityRatio == shares) {
      // removing liquidity from market
      market.balance = market.balance.sub(liquidityRatio);
      market.liquidity = market.liquidity.sub(liquidityRatio);

      for (uint256 i = 0; i < market.outcomeIds.length; i++) {
        uint256 outcomeId = market.outcomeIds[i];
        MarketOutcome storage outcome = market.outcomes[outcomeId];

        outcome.shares.available = outcome.shares.available.sub(liquidityRatio);
        outcome.shares.total = outcome.shares.total.sub(liquidityRatio);

        market.sharesTotal = market.sharesTotal.sub(liquidityRatio);
        market.sharesAvailable = market.sharesAvailable.sub(liquidityRatio);
      }

      value = shares;
    } else {
      // buying shares from the opposite markets
      uint256 outcomeId = minOutcomeId == 0 ? 1 : 0;

      // value received: Total Liquidity / Shares Outcome * Liquidity Removed
      value = market.liquidity.mul(shares).div(market.outcomes[outcomeId].shares.available);

      // removing liquidity from market (shares = value)
      market.liquidity = market.liquidity.sub(shares);

      buy(marketId, outcomeId, value, MarketAction.removeLiquidity);
      // msg.sender.transfer(value);
    }

    // transferring user ETH from liquidity removed
    msg.sender.transfer(value);

    emit ParticipantAction(msg.sender, MarketAction.removeLiquidity, marketId, 0, shares, value, now);
    emit MarketLiquidity(marketId, market.liquidity, getMarketLiquidityPrice(marketId), now);
  }

  /// Determine the result of the market
  /// @dev Only allowed by oracle
  /// @return Id of the outcome
  function resolveMarketOutcome(uint256 marketId)
    public
    timeTransitions(marketId)
    atState(marketId, MarketState.closed)
    transitionNext(marketId)
    returns (uint256)
  {
    Market storage market = markets[marketId];

    RealitioERC20 realitio = RealitioERC20(realitioAddress);
    // will throw an error if question is not finalized
    uint256 outcomeId = uint256(realitio.resultFor(market.resolution.questionId));

    MarketOutcome storage outcome = market.outcomes[outcomeId];

    // TODO: process outcome

    market.resolution.outcomeId = outcomeId;

    emit MarketResolved(market.resolution.oracle, marketId, outcomeId);
    // emitting 1 price event for winner outcome
    emit MarketOutcomePrice(marketId, outcomeId, ONE, now);
    // emitting 0 price event for loser outcome
    emit MarketOutcomePrice(marketId, (outcomeId == 0 ? 1 : 0), 0, now);
    // final liquidity price = outcome shares / liquidity shares
    uint256 liquidityPrice = outcome.shares.available.mul(ONE).div(market.liquidity);
    emit MarketLiquidity(marketId, market.liquidity, liquidityPrice, now);

    return market.resolution.outcomeId;
  }

  /// Allowing holders of resolved outcome shares to claim earnings.
  function claimWinnings(uint256 marketId) public atState(marketId, MarketState.resolved) {
    Market storage market = markets[marketId];
    MarketOutcome storage resolvedOutcome = market.outcomes[market.resolution.outcomeId];

    require(resolvedOutcome.shares.holders[msg.sender] > 0, "Participant does not hold resolved outcome shares");
    require(
      resolvedOutcome.shares.claims[msg.sender] == false,
      "Participant already claimed resolved outcome winnings"
    );

    // 1 share = 1 ETH
    uint256 value = resolvedOutcome.shares.holders[msg.sender];

    // assuring market has enough funds
    require(market.balance >= value, "Market does not have enough balance");

    market.balance = market.balance.sub(value);
    resolvedOutcome.shares.claims[msg.sender] = true;

    emit ParticipantAction(
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

  /// Allowing liquidity providers to claim earnings from liquidity providing.
  function claimLiquidity(uint256 marketId) public atState(marketId, MarketState.resolved) {
    Market storage market = markets[marketId];
    MarketOutcome storage resolvedOutcome = market.outcomes[market.resolution.outcomeId];

    // claiming any pending fees
    claimFees(marketId);

    require(market.liquidityShares[msg.sender] > 0, "Participant does not hold liquidity shares");
    require(market.liquidityClaims[msg.sender] == false, "Participant already claimed liquidity winnings");

    // value = total resolved outcome pool shares * pool share (%)
    uint256 value = resolvedOutcome.shares.available.mul(getUserLiquidityPoolShare(marketId, msg.sender)).div(ONE);

    // assuring market has enough funds
    require(market.balance >= value, "Market does not have enough balance");

    market.balance = market.balance.sub(value);
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

  function claimFees(uint256 marketId) public payable {
    Market storage market = markets[marketId];

    uint256 claimableFees = getUserClaimableFees(marketId, msg.sender);

    if (claimableFees > 0) {
      market.fees.claimed[msg.sender] = market.fees.claimed[msg.sender].add(claimableFees);
      msg.sender.transfer(claimableFees);
    }

    // TODO: trigger event
  }

  function addTransactionToFeesPool(uint256 marketId, uint256 value) internal returns (uint256) {
    Market storage market = markets[marketId];
    uint256 feeAmount = value.mul(market.fees.value) / ONE;

    market.fees.poolWeight = market.fees.poolWeight.add(feeAmount);

    // returning investment minus fees
    return value.sub(feeAmount);
  }

  function rebalanceFeesPool(
    uint256 marketId,
    uint256 liquidityShares,
    MarketAction action
  ) internal returns (uint256) {
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

  /// Internal function for advancing the market state.
  function nextState(uint256 marketId) internal {
    Market storage market = markets[marketId];
    market.state = MarketState(uint256(market.state) + 1);
  }

  function emitMarketOutcomePriceEvents(uint256 marketId) internal {
    Market storage market = markets[marketId];

    for (uint256 i = 0; i < market.outcomeIds.length; i++) {
      emit MarketOutcomePrice(marketId, i, getMarketOutcomePrice(marketId, i), now);
    }

    // liquidity shares also change value
    emit MarketLiquidity(marketId, market.liquidity, getMarketLiquidityPrice(marketId), now);
  }

  // ------ Core Functions End ------

  // ------ Governance Functions Start ------

  function setFee(uint256 feeValue) public onlyOwner() {
    fee = feeValue;
  }

  function setRealitioERC20(address addr) public onlyOwner() {
    realitioAddress = addr;
  }

  function setRealitioTimeout(uint256 timeout) public onlyOwner() {
    realitioTimeout = timeout;
  }

  // ------ Governance Functions End ------

  // ------ Getters ------

  function getUserMarketShares(uint256 marketId, address participant)
    public
    view
    returns (
      uint256,
      uint256,
      uint256
    )
  {
    Market storage market = markets[marketId];

    return (
      market.liquidityShares[participant],
      market.outcomes[0].shares.holders[participant],
      market.outcomes[1].shares.holders[participant]
    );
  }

  function getUserClaimStatus(uint256 marketId, address participant)
    public
    view
    returns (
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

    MarketOutcome storage outcome = market.outcomes[market.resolution.outcomeId];

    return (
      outcome.shares.holders[participant] > 0,
      outcome.shares.claims[participant],
      market.liquidityShares[participant] > 0,
      market.liquidityClaims[participant]
    );
  }

  // @return % of liquidity pool stake
  function getUserLiquidityPoolShare(uint256 marketId, address participant) public view returns (uint256) {
    Market storage market = markets[marketId];

    return market.liquidityShares[participant].mul(ONE).div(market.liquidity);
  }

  function getUserClaimableFees(uint256 marketId, address participant) public view returns (uint256) {
    Market storage market = markets[marketId];

    uint256 rawAmount = market.fees.poolWeight.mul(market.liquidityShares[participant]).div(market.liquidity);
    return rawAmount.sub(market.fees.claimed[participant]);
  }

  /// Allow retrieving the the array of created contracts
  /// @return An array of all created Market contracts
  function getMarkets() public view returns (uint256[] memory) {
    return marketIds;
  }

  function getMarketData(uint256 marketId)
    public
    view
    returns (
      string memory,
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
      market.name,
      market.state,
      market.closedDateTime,
      market.liquidity,
      market.balance,
      market.sharesAvailable,
      getMarketResolvedOutcome(marketId)
    );
  }

  function getMarketQuestion(uint256 marketId) public view returns (bytes32) {
    Market storage market = markets[marketId];

    return (market.resolution.questionId);
  }

  function getMarketPrices(uint256 marketId)
    public
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

    if (market.state == MarketState.resolved) {
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

  // ------ Outcome Getters ------

  function getMarketOutcomeIds(uint256 marketId) public view returns (uint256[] memory) {
    Market storage market = markets[marketId];
    return market.outcomeIds;
  }

  function getMarketOutcomePrice(uint256 marketId, uint256 marketOutcomeId) public view returns (uint256) {
    Market storage market = markets[marketId];
    MarketOutcome storage outcome = market.outcomes[marketOutcomeId];

    if (market.state == MarketState.resolved) {
      // resolved market, price is either 0 or 1
      return marketOutcomeId == market.resolution.outcomeId ? ONE : 0;
    }

    require(
      outcome.shares.total >= outcome.shares.available,
      "Total shares has to be equal or higher than available shares"
    );
    require(
      market.sharesAvailable >= outcome.shares.available,
      "Total # available shares has to be equal or higher than outcome available shares"
    );

    uint256 holders = market.sharesAvailable.sub(outcome.shares.available);

    return holders.mul(ONE).div(market.sharesAvailable);
  }

  function getMarketOutcomeData(uint256 marketId, uint256 marketOutcomeId)
    public
    view
    returns (
      string memory,
      uint256,
      uint256,
      uint256
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
}
