// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma abicoder v2; //needed to return struct

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./FunctionCall.sol";
import "../utils/Ownable.sol";

/// @title ProtocolMiningReward smart contract
/// @dev This contract uses FunctionCall smart contract for specific functions
/// to use protocol mining with token reward.
contract ProtocolMiningReward is Ownable, FunctionCall
{
  using SafeMath for uint256;
  
  using EnumerableSet for EnumerableSet.Bytes32Set;
  
  // all registered and allowed calls
  EnumerableSet.Bytes32Set private calls;

  // reward token amount for each registered/allowed call
  mapping(bytes32 => uint256) public callsRewardTokenAmount;


  /// @notice constructor
  /// @param _rewardToken Reward token
  /// @param _rewardAmount Reward token amount
  constructor(IERC20 _rewardToken, uint256 _rewardAmount)
    FunctionCall(_rewardToken, _rewardAmount)
  {
  }

  modifier requireValidCallIndex(uint256 i) {
    _requireValidCallIndex(i);
    _;
  }

  /// @notice require given call index to be in range
  /// @param i Call index in array of approved calls
  function _requireValidCallIndex(uint256 i) internal view {
    require(i < calls.length(), "ID_OORI"); //ID Out Of Range Index
  }



  /// @notice Returns the identifier of an operation containing a single transaction.
  /// @param target Target contract address
  /// @param func Target contract function selector
  /// @return hash Resulting keccak256 hash for given parameters
  function hashOperation(address target, bytes4 func) public pure virtual returns (bytes32 hash) {
    return keccak256(abi.encode(target, func));
  }

  /// @notice Returns the identifier of an operation containing a single transaction
  /// given encoded call data.
  /// @param target Target contract address
  /// @param data Target contract function encoded call data
  /// @return hash Resulting keccak256 hash for given parameters
  function hashOperationData(address target, bytes memory data) public pure virtual returns (bytes32 hash) {
    return keccak256(abi.encode(target, data));
  }

  /// @notice Returns the identifier of an operation containing a batch of transactions.
  /// @param targets Target contracts addresses
  /// @param funcs Target contracts function selectors
  /// @return hash Resulting keccak256 hash for given parameters
  function hashOperationBatch(address[] memory targets, bytes4[] memory funcs) public pure virtual returns (bytes32 hash) {
    return keccak256(abi.encode(targets, funcs));
  }

  /// @notice Returns the identifier of an operation containing a batch of transactions
  /// given encoded call datas.
  /// @param targets Target contracts addresses
  /// @param datas Target contracts function encoded call datas
  /// @return hash Resulting keccak256 hash for given parameters
  function hashOperationBatchData(address[] memory targets, bytes[] memory datas) public pure virtual returns (bytes32 hash) {
    return keccak256(abi.encode(targets, datas));
  }



  /// @notice Approve call
  /// @param _target Target contract address
  /// @param _funcSelector Target contract function selector
  /// @param _rewardTokenAmount Reward token amount for sender
  /// @return True if new call or false if existing
  function approveCall(
    address _target,
    bytes4 _funcSelector,
    uint256 _rewardTokenAmount
  ) external onlyOwner returns (bool)
  {
    //require(_target != address(rewardToken), "Reward token not allowed");
    bytes32 id = hashOperation(_target, _funcSelector);
    return _approveCall(id, _rewardTokenAmount);
  }

  /// @notice Approve call
  /// @param _target Contract address to call
  /// @param _callData Target contract encoded call data with function selector and params
  /// @param _rewardTokenAmount Token reward amount to sender
  /// @return True if new call or false if existing
  function approveCallData(
    address _target, // target contract address
    bytes memory _callData, // target contract encoded call data with function selector and params
    uint256 _rewardTokenAmount
  ) external onlyOwner returns (bool)
  {
    //require(_target != address(rewardToken), "Reward token not allowed");
    bytes32 id = hashOperationData(_target, _callData);
    return _approveCall(id, _rewardTokenAmount);
  }

  /// @notice Approve calls as batch
  /// @param _targets Contract addresses to call
  /// @param _funcSelectors Target contract function selectors
  /// @param _rewardTokenAmount Token reward amount to sender
  /// @return True if new call or false if existing
  function approveBatch(
    address[] memory _targets, // target contract addresses
    bytes4[] memory _funcSelectors, // target contract function selectors
    uint256 _rewardTokenAmount
  ) external onlyOwner returns (bool)
  {
    bytes32 id = hashOperationBatch(_targets, _funcSelectors);
    return _approveCall(id, _rewardTokenAmount);
  }

  /// @notice Approve calls as batch
  /// @param _targets Contract addresses to call
  /// @param _callDatas Target contract function selectors
  /// @param _rewardTokenAmount Token reward amount to sender
  /// @return True if new call or false if existing
  function approveBatchData(
    address[] memory _targets, // target contract addresses
    bytes[] memory _callDatas, // target contract encoded call datas with function selectors and params
    uint256 _rewardTokenAmount
  ) external onlyOwner returns (bool)
  {
    bytes32 id = hashOperationBatchData(_targets, _callDatas);
    return _approveCall(id, _rewardTokenAmount);
  }

  /// @notice Approve call
  /// @param _callHash Call hash
  /// @param _rewardTokenAmount Token reward amount to sender
  /// @return True if new call or false if existing
  function _approveCall(
    bytes32 _callHash,
    uint256 _rewardTokenAmount
  ) internal returns (bool)
  {
    bool added = false;

    if (!calls.contains(_callHash)) {
      calls.add(_callHash);
      added = true;
    }
    
    // update call reward
    if (callsRewardTokenAmount[_callHash] != _rewardTokenAmount)
      callsRewardTokenAmount[_callHash] = _rewardTokenAmount;
    
    return added;
  }

  /// @notice Disapprove call
  /// @param _target Target contract address
  /// @param _funcSelector Target contract function selector
  function disapproveCall(
    address _target,
    bytes4 _funcSelector
  ) external onlyOwner
  {
    bytes32 id = hashOperation(_target, _funcSelector);
    require(calls.contains(id), "Function call must be approved");
    calls.remove(id);
  }

  /// @notice Disapprove call
  /// @param _target Target contract address
  /// @param _callData Target contract encoded call data with function selector and params
  function disapproveCallData(
    address _target,
    bytes memory _callData
  ) external onlyOwner
  {
    bytes32 id = hashOperationData(_target, _callData);
    require(calls.contains(id), "Function call must be approved");
    calls.remove(id);
  }

  /// @notice Disapprove calls batch
  /// @param _targets Target contract address
  /// @param _funcSelectors Target contract function selector
  function disapproveBatch(
    address[] memory _targets,
    bytes4[] memory _funcSelectors
  ) external onlyOwner
  {
    bytes32 id = hashOperationBatch(_targets, _funcSelectors);
    require(calls.contains(id), "Function call must be approved");
    calls.remove(id);
  }

  /// @notice Disapprove calls batch
  /// @param _targets Target contract addresses
  /// @param _callDatas Target contract encoded call datas with function selectors and params
  function disapproveBatchData(
    address[] memory _targets, // target contract addresses
    bytes[] memory _callDatas // target contract encoded call datas with function selectors and params
  ) external onlyOwner
  {
    bytes32 id = hashOperationBatchData(_targets, _callDatas);
    require(calls.contains(id), "Function call must be approved");
    calls.remove(id);
  }

  /// @notice Clear all approved calls
  function disapproveAll() external onlyOwner
  {
    uint256 count = calls.length();
    if (count == 0)
      return;
    for (uint256 i=count-1; i>=0 && i<count; i--) {
      bytes32 id = calls.at(i);
      calls.remove(id);
      delete callsRewardTokenAmount[id];
    }
  }

  /// @notice Execute call
  /// @param target Target contract address
  /// @param callFunc Target contract function selector
  /// @param callParam Function parameters as encoded call data
  /// @return True if success, false otherwise
  function execute(
    address target
    , bytes4 callFunc
    , bytes memory callParam
    ) external payable virtual returns (bool)
  {
    bytes32 id = hashOperation(target, callFunc);
    require(calls.contains(id), "Function call not approved");
    
    bytes memory callData = abi.encodePacked(callFunc, callParam);
    (bool success, bytes memory returnData) = _call(target, msg.value, callData);
    require(success, "CF"); //call failed
    //(success && (!boolReturn || returnData.length == 0 || abi.decode(returnData, (bool)))

    sendRewardTokens(msg.sender, callsRewardTokenAmount[id]); // send reward tokens to tx sender
    
    return success;
  }

  /// @notice Execute call with function selector already encoded in call data
  /// @param target Target contract address
  /// @param callData Function call with parameters as encoded call data
  /// @return True if success, false otherwise
  function executeData(
    address target
    , bytes memory callData
    ) public payable virtual returns (bool)
  {
    bytes32 id = hashOperationData(target, callData);
    require(calls.contains(id), "Function call not approved");
    
    (bool success, bytes memory returnData) = _call(target, msg.value, callData);
    require(success, "CF"); //call failed
    //(success && (!boolReturn || returnData.length == 0 || abi.decode(returnData, (bool)))

    sendRewardTokens(msg.sender, callsRewardTokenAmount[id]); // send reward tokens to tx sender
    
    return success;
  }

  /// @notice Execute calls batch
  /// @param targets Target contracts addresses
  /// @param values Eth values for each call
  /// @param callFuncs Target contracts function selectors
  /// @param callParams Target contracts function params as encoded datas
  /// @return True if success, false otherwise
  function executeBatch(
    address[] calldata targets
    , uint256[] calldata values
    , bytes4[] calldata callFuncs
    , bytes[] calldata callParams
    ) external payable virtual returns (bool)
  {
    require(targets.length == values.length
      && targets.length == callFuncs.length
      && targets.length == callParams.length,
      "Length mismatch");

    bytes32 id = hashOperationBatch(targets, callFuncs);
    require(calls.contains(id), "Function call not approved");

    bool success;
    bytes memory returnData;
    for (uint256 i = 0; i < targets.length; ++i) {
      (success, returnData) = _call(targets[i], values[i], callFuncs[i], callParams[i]);
      require(success, string(abi.encodePacked("CF", Strings.toString(i)))); //call failed
    }

    sendRewardTokens(msg.sender, callsRewardTokenAmount[id]); // send reward tokens to tx sender

    return true;
  }

  /// @notice Execute calls batch with encoded call datas
  /// @param targets Target contracts addresses
  /// @param values Eth values for each call
  /// @param callDatas Target contracts function params as encoded datas
  /// @return True if success, false otherwise
  function executeBatchData(
    address[] calldata targets
    , uint256[] calldata values
    , bytes[] calldata callDatas
    ) external payable virtual returns (bool)
  {
    require(targets.length == values.length 
      && targets.length == callDatas.length,
      "Length mismatch");

    bytes32 id = hashOperationBatchData(targets, callDatas);
    require(calls.contains(id), "Function call not approved");

    bool success;
    bytes memory returnData;
    for (uint256 i = 0; i < targets.length; ++i) {
      (success, returnData) = _call(targets[i], values[i], callDatas[i]);
      require(success, string(abi.encodePacked("CF", Strings.toString(i)))); //call failed
    }

    sendRewardTokens(msg.sender, callsRewardTokenAmount[id]); // send reward tokens to tx sender

    return true;
  }

  
  
  function transferThrough(address target, address tokenIn, address from, uint256 amountIn) external {
    // Transfer the specified amount of 'tokenIn' to this contract.
    if (from != address(this))
      TransferHelper.safeTransferFrom(tokenIn, from, address(this), amountIn);
    
    // Approve the router to spend tokenIn.
    TransferHelper.safeApprove(tokenIn, target, amountIn);
  }

  /// @notice Send reward tokens from this contract to sender
  /// @param to Recipient address
  /// @param rewardTokenAmount Reward token amount
  function sendRewardTokens(address to, uint256 rewardTokenAmount) internal {
    TransferHelper.safeTransfer(address(rewardToken), to, rewardTokenAmount);
  }

  /// @notice Send tokens back to sender after action call, e.g. for tokens exchange
  /// @param token Token address
  /// @param to Recipient address
  /// @param tokensAmount Reward token amount
  function sendTokens(address token, address to, uint256 tokensAmount) internal {
    TransferHelper.safeTransfer(token, to, tokensAmount);
  }



  /// @notice Get call hash by index
  /// @param i Call index
  /// @return callHash call hash
  function getCallHashByIndex(uint256 i) requireValidCallIndex(i) external view returns (bytes32 callHash) {
    return calls.at(i);
  }

  /// @notice Get calls array length
  /// @return calls count
  function callsCount() external view returns (uint256) {
    return calls.length();
  }

  /// @notice Return true if call hash is approved (exists), false otherwise
  /// @param callHash Call hash
  /// @return True if approved, false otherwise
  function callApproved(bytes32 callHash) external view returns (bool) {
    return calls.contains(callHash);
  }

  /// @notice Remove call by hash
  /// @param callHash Call hash
  function removeCallHash(bytes32 callHash) external onlyOwner
  {
    //require(calls.contains(callHash), "Function call must be approved");
    if (calls.contains(callHash)) {
      calls.remove(callHash);
      delete callsRewardTokenAmount[callHash];
    }
  }
}