pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./RealitioERC20.sol";
import "./PredictionMarket.sol";

/// @title Prediction Market Achievements Contract
contract PredictionMarketAchievement {
  /// @dev protocol is immutable and has no ownership
  RealitioERC20 public realitioERC20;
  PredictionMarket public predictionMarket;

  // First Prediction
  // Claim through market[x].outcome[y].shares.holders[msg.sender] > 0

  // First Market Created
  // TODO

  // First Claim Winnings
  // Claim through market[x].outcome[y].shares.holders[msg.sender] > 0 && y == market.resolution.outcomeId

  // First POLK Bond
  // Use RealitioERC20 historyHashes logic value and ensure addrs.includes(msg.sender)

  // Most Volume (Week #X of Year Y)

  constructor(
    RealitioERC20 _realitioERC20,
    PredictionMarket _predictionMarket
  ) public {
    require(address(_predictionMarket) != address(0), "__predictionMarket address is 0");
    require(address(_realitioERC20) != address(0), "_realitioERC20 address is 0");

    predictionMarket = _predictionMarket;
    realitioERC20 = _realitioERC20;
  }

  // TODO claim ERC721
}
