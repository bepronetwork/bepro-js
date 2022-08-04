// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma abicoder v2; //needed to return struct

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/TimelockController.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./FunctionCall.sol";
import "../utils/Ownable.sol";

/// @title TimeLockProtocolMiningReward smart contract
/// @dev This contract is based on @openzeppelin/contracts/access/TimelockController.sol
/// to use protocol mining with token reward.
contract TimeLockProtocolMiningReward is Ownable
, FunctionCall
, TimelockController
{
  using SafeMath for uint256;
  
  //using EnumerableSet for EnumerableSet.Bytes32Set;
  
  // all registered and allowed calls
  //EnumerableSet.Bytes32Set private calls;

  // reward token amount for each registered/allowed call
  mapping(bytes32 => uint256) public callsRewardTokenAmount;


  /// @notice constructor
  /// @param minDelay Minimum delay in seconds to schedule call
  /// @param proposers Array of proposers addresses
  /// @param executors Array of executors addresses
  /// @param rewardTokenAddress Reward token address
  /// @param defaultRewardAmount Default reward token amount
  constructor(uint256 minDelay, address[] memory proposers, address[] memory executors
    , IERC20 rewardTokenAddress, uint256 defaultRewardAmount) public
    FunctionCall(rewardTokenAddress, defaultRewardAmount)
    TimelockController(minDelay, proposers, executors)
  {
  }

  /// @dev Schedule an operation containing a single transaction.
  /// @param target Target contract address
  /// @param value Eth value sent with the call
  /// @param data Encoded call data
  /// @param predecessor Required call id to be finished before executing current call
  /// @param salt Salt id
  /// @param delay Delay for call execution
  /// @param rewardTokenAmount Reward token amount
  /// Emits a {CallScheduled} event.
  /// Requirements:
  /// - the caller must have the 'proposer' role.
  ///
  function schedule(
    address target, uint256 value, bytes calldata data, bytes32 predecessor
    , bytes32 salt, uint256 delay, uint256 rewardTokenAmount)
    public virtual onlyRole(PROPOSER_ROLE)
  {
    super.schedule(target, value, data, predecessor, salt, delay);
    bytes32 id = hashOperation(target, value, data, predecessor, salt);
    callsRewardTokenAmount[id] = rewardTokenAmount;
  }

  /// @dev Schedule an operation containing a batch of transactions.
  /// @param targets Target contracts addresses
  /// @param values Eth values sent with the batch
  /// @param datas Encoded call datas
  /// @param predecessor Required call id to be finished before executing current call
  /// @param salt Salt id
  /// @param delay Delay for call execution
  /// @param rewardTokenAmount Reward token amount
  /// Emits one {CallScheduled} event per transaction in the batch.
  /// Requirements:
  /// - the caller must have the 'proposer' role.
  ///
  function scheduleBatch(
    address[] calldata targets, uint256[] calldata values, bytes[] calldata datas
    , bytes32 predecessor, bytes32 salt, uint256 delay, uint256 rewardTokenAmount)
    public virtual onlyRole(PROPOSER_ROLE)
  {
    super.scheduleBatch(targets, values, datas, predecessor, salt, delay);
    bytes32 id = hashOperationBatch(targets, values, datas, predecessor, salt);
    callsRewardTokenAmount[id] = rewardTokenAmount;
  }

  /// @dev Cancel an operation.
  /// @param id Call hash
  /// Requirements:
  /// - the caller must have the 'proposer' role.
  ///
  function cancel(bytes32 id) public virtual override onlyRole(PROPOSER_ROLE) {
    super.cancel(id);
    delete callsRewardTokenAmount[id];
  }

  /// @dev Execute an (ready) operation containing a single transaction.
  /// @param target Target contract address
  /// @param value Eth value sent with the call
  /// @param data Encoded call data
  /// @param predecessor Required call id to be finished before executing current call
  /// @param salt Salt id
  /// Emits a {CallExecuted} event.
  /// Requirements:
  /// - the caller must have the 'executor' role.
  ///
  function execute(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt)
    public payable virtual override onlyRole(EXECUTOR_ROLE)
  {
    super.execute(target, value, data, predecessor, salt);
    bytes32 id = hashOperation(target, value, data, predecessor, salt);
    sendRewardTokens(msg.sender, callsRewardTokenAmount[id]); // send reward tokens to tx sender
  }

  /// @dev Execute an (ready) operation containing a batch of transactions.
  /// @param targets Target contracts addresses
  /// @param values Eth values sent with the batch
  /// @param datas Encoded call datas
  /// @param predecessor Required call id to be finished before executing current call
  /// @param salt Salt id
  /// Emits one {CallExecuted} event per transaction in the batch.
  /// Requirements:
  /// - the caller must have the 'executor' role.
  ///
  function executeBatch(
    address[] calldata targets, uint256[] calldata values, bytes[] calldata datas
    , bytes32 predecessor, bytes32 salt)
    public payable virtual override onlyRole(EXECUTOR_ROLE)
  {
    super.executeBatch(targets, values, datas, predecessor, salt);
    bytes32 id = hashOperationBatch(targets, values, datas, predecessor, salt);
    sendRewardTokens(msg.sender, callsRewardTokenAmount[id]); // send reward tokens to tx sender
  }

  /// @notice Send reward tokens from this contract to sender
  /// @param to Recipient address
  /// @param rewardTokenAmount Reward token amount
  function sendRewardTokens(address to, uint256 rewardTokenAmount) internal {
    TransferHelper.safeTransfer(address(rewardToken), to, rewardTokenAmount);
  }
}