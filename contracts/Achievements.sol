pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./RealitioERC20.sol";
import "./PredictionMarket.sol";

// openzeppelin imports
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Prediction Market Achievements Contract
contract Achievements is ERC721 {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  /// @dev protocol is immutable and has no ownership
  RealitioERC20 public realitioERC20;
  PredictionMarket public predictionMarket;

  // Buy: Claim through market[x].outcome[y].shares.holders[msg.sender] > 0
  // AddLiquidity: Claim through market[x].liquidityShares[msg.sender] > 0
  // CreateMarket: RealitioERC20 question arbitrator == msg.sender
  // ClaimWinnings: Claim through market[x].outcome[y].shares.holders[msg.sender] > 0 && y == market.resolution.outcomeId
  // Bond: Use RealitioERC20 historyHashes logic value and ensure addrs.includes(msg.sender)
  enum Action {
    Buy,
    AddLiquidity,
    Bond,
    ClaimWinnings,
    CreateMarket
  }

  struct Achievement {
    Action action;
    uint256 occurrences;
    mapping(address => bool) claims;
  }

  uint256 public achievementIndex = 0;
  mapping(uint256 => Achievement) public achievements;
  mapping(uint256 => uint256) public tokens; // tokenId => achievementId

  constructor() public ERC721("Achievements", "PMA") {}

  function setContracts(PredictionMarket _predictionMarket, RealitioERC20 _realitioERC20) public {
    require(address(predictionMarket) == address(0), "predictionMarket can only be initialized once");
    require(address(realitioERC20) == address(0), "realitioERC20 can only be initialized once");

    require(address(_predictionMarket) != address(0), "_predictionMarket address is 0");
    require(address(_realitioERC20) != address(0), "_realitioERC20 address is 0");

    predictionMarket = _predictionMarket;
    realitioERC20 = _realitioERC20;
  }

  function setBaseURI(string memory _baseURI) public {
    require(bytes(baseURI()).length == 0, "baseURI can only be initialized once");

    _setBaseURI(_baseURI);
  }

  function createAchievement(Action action, uint256 occurrences) public returns (uint256) {
    require(occurrences > 0, "occurrences has to be greater than 0");
    uint256 achievementId = achievementIndex;
    Achievement storage achievement = achievements[achievementId];

    achievement.action = action;
    achievement.occurrences = occurrences;
    // emit LogNewAchievement(achievementId, msg.sender, content);
    achievementIndex = achievementId + 1;
    return achievementId;
  }

  function hasUserClaimedAchievement(address user, uint256 achievementId) public view returns (bool) {
    Achievement storage achievement = achievements[achievementId];

    return achievement.claims[user];
  }

  function hasUserPlacedPrediction(address user, uint256 marketId) public view returns (bool) {
    uint256[2] memory outcomeShares;
    (, outcomeShares[0], outcomeShares[1]) = predictionMarket.getUserMarketShares(marketId, user);

    require(outcomeShares[0] > 0 || outcomeShares[1] > 0, "user does not hold outcome shares");

    return true;
  }

  function hasUserAddedLiquidity(address user, uint256 marketId) public view returns (bool) {
    uint256 liquidityShares;
    (liquidityShares, , ) = predictionMarket.getUserMarketShares(marketId, user);

    require(liquidityShares > 0, "user does not hold liquidity shares");

    return true;
  }

  function hasUserPlacedBond(
    address user,
    uint256 marketId,
    bytes32[] memory history_hashes,
    address[] memory addrs,
    uint256[] memory bonds,
    bytes32[] memory answers
  ) public view returns (bool) {
    bytes32 last_history_hash;
    bytes32 questionId;
    (, questionId, ) = predictionMarket.getMarketAltData(marketId);
    (, , , , , , , , last_history_hash, ) = realitioERC20.questions(questionId);
    bool bonded;

    uint256 i;
    for (i = 0; i < history_hashes.length; i++) {
      require(
        last_history_hash == keccak256(abi.encodePacked(history_hashes[i], answers[i], bonds[i], addrs[i], false))
      );

      if (addrs[i] == user) bonded = true;

      last_history_hash = history_hashes[i];
    }

    require(bonded == true, "user has not placed a bond in market");

    return true;
  }

  function hasUserClaimedWinnings(address user, uint256 marketId) public view returns (bool) {
    uint256[2] memory outcomeShares;
    (, outcomeShares[0], outcomeShares[1]) = predictionMarket.getUserMarketShares(marketId, user);
    int256 resolvedOutcomeId = predictionMarket.getMarketResolvedOutcome(marketId);

    require(resolvedOutcomeId >= 0, "market is still not resolved");
    require(outcomeShares[uint256(resolvedOutcomeId)] > 0, "user does not hold winning outcome shares");

    return true;
  }

  function hasUserCreatedMarket(address user, uint256 marketId) public view returns (bool) {
    require(user != address(0), "user address is 0x0");

    bytes32 questionId;
    address arbitrator;
    (, questionId, ) = predictionMarket.getMarketAltData(marketId);
    (, arbitrator, , , , , , , , ) = realitioERC20.questions(questionId);

    require(user == arbitrator, "user did not create market");

    return true;
  }

  function claimAchievement(uint256 achievementId, uint256[] memory marketIds) public returns (uint256) {
    Achievement storage achievement = achievements[achievementId];

    require(achievement.claims[msg.sender] == false, "Achievement already claimed");
    require(achievement.action != Action.Bond, "Method not used for bond placement achievements");
    require(marketIds.length == achievement.occurrences, "Markets count and occurrences don't match");

    for (uint256 i = 0; i < marketIds.length; i++) {
      uint256 marketId = marketIds[i];

      if (achievement.action == Action.Buy) {
        hasUserPlacedPrediction(msg.sender, marketId);
      } else if (achievement.action == Action.AddLiquidity) {
        hasUserAddedLiquidity(msg.sender, marketId);
      } else if (achievement.action == Action.ClaimWinnings) {
        hasUserClaimedWinnings(msg.sender, marketId);
      } else if (achievement.action == Action.CreateMarket) {
        hasUserCreatedMarket(msg.sender, marketId);
      } else {
        revert("Invalid achievement action");
      }
    }

    mintAchievement(msg.sender, achievementId);
  }

  function claimAchievement(
    uint256 achievementId,
    uint256[] memory marketIds,
    uint256[] memory lengths,
    bytes32[] memory history_hashes,
    address[] memory addrs,
    uint256[] memory bonds,
    bytes32[] memory answers
  ) public {
    Achievement storage achievement = achievements[achievementId];

    require(achievement.claims[msg.sender] == false, "Achievement already claimed");
    require(achievement.action == Action.Bond, "Method only used for bond placement achievements");
    require(marketIds.length > 0, "No actions provided");
    require(marketIds.length == achievement.occurrences, "Markets count and occurrences don't match");

    uint256 qi;

    for (uint256 i = 0; i < marketIds.length; i++) {
      uint256 marketId = marketIds[i];

      uint256 ln = lengths[i];
      bytes32[] memory hh = new bytes32[](ln);
      address[] memory ad = new address[](ln);
      uint256[] memory bo = new uint256[](ln);
      bytes32[] memory an = new bytes32[](ln);
      uint256 j;
      for (j = 0; j < ln; j++) {
        hh[j] = history_hashes[qi];
        ad[j] = addrs[qi];
        bo[j] = bonds[qi];
        an[j] = answers[qi];
        qi++;
      }
      hasUserPlacedBond(msg.sender, marketId, hh, ad, bo, an);
    }

    mintAchievement(msg.sender, achievementId);
  }

  function mintAchievement(address user, uint256 achievementId) private returns (uint256) {
    _tokenIds.increment();

    uint256 tokenId = _tokenIds.current();
    _mint(user, tokenId);
    tokens[tokenId] = achievementId;

    Achievement storage achievement = achievements[achievementId];
    achievement.claims[user] = true;

    return tokenId;
  }

  function tokenIndex() public view returns (uint256) {
    return _tokenIds.current();
  }
}
