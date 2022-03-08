// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

/// @title Utilities smart contract for generating function selector given its signature as string,
/// useful for calling other contracts functions from a smart contract without abi.
abstract contract FunctionSelector {
  
  /// @notice Get function selector.
  /// @dev Compute keccak256 for bytes of string of a function signature,
  /// and get the first 4 bytes.
  /// For example: "transfer(address,uint256)" from ERC20 contract would give us 0xa9059cbb
  /// @param funcSig The function signature as string.
  /// @return first 4 bytes of the computed keccak256.
  function getFunctionSelector(string memory funcSig) public pure returns (bytes4) {
    return bytes4(keccak256(bytes(funcSig)));
  }
}