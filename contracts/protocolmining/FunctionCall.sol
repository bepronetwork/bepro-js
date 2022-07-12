// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

//import "./IERC20Token.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "../utils/FunctionSelector.sol";

/**
 * @title FunctionCall smart contract
 * @dev This contract allows sender to call other smart contracts functions.
 */
contract FunctionCall is Context, FunctionSelector
{
  IERC20 public rewardToken;
  uint256 public rewardAmount;

  constructor(IERC20 _rewardToken, uint256 _rewardAmount) {
    rewardToken = _rewardToken;
    rewardAmount = _rewardAmount;
  }


  
  /// @dev send eth value to target address
  function _sendValue(address target, uint256 value) internal
    returns (bool, bytes memory)
  {
    // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
    (bool success, bytes memory returnData) = target.call{value: value}("");
    return (success, returnData);
  }

  function _call(address target, uint256 value, bytes memory callData) internal
    returns (bool, bytes memory)
  {
    // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
    (bool success, bytes memory returnData) = target.call{value: value}(callData);
    return (success, returnData);
  }

  function _call(address target, uint256 value, bytes4 callFunc, bytes memory callParams) internal
    returns (bool, bytes memory)
  {
    bytes memory callData = abi.encodePacked(callFunc, callParams);
    // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
    (bool success, bytes memory returnData) = target.call{value: value}(callData);
    return (success, returnData);
  }

  function _call(address target, uint256 value, string memory callFuncSig, bytes memory callParams) internal
    returns (bool, bytes memory)
  {
    bytes memory callData = abi.encodePacked(getFunctionSelector(callFuncSig), callParams);
    // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
    (bool success, bytes memory returnData) = target.call{value: value}(callData);
    return (success, returnData);
  }
}