// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

/// @title Library for calculating percentages like parts/total for example 35/10000 for 0.35%.
/// @dev Percentages math utilities.
library SafePercentMath {
  using SafeMath for uint256;
  
  /// @dev Calculate percent as parts 'parts' per X amount 'perX' from given number 'amount'
  /// @param amount Amount to calculate percent for
  /// @param parts Parts of the percent e.g. (7) parts per 1000.
  /// @param perX Per X amount of the percent, like 7 parts per (1000) perX.
  /// @return p percent amount tokens
  function percent(uint256 amount, uint256 parts, uint256 perX) internal pure returns (uint256 p) {
    require(perX > 0, "SafeMathLib.percent: required perX > 0");
    if (amount == 0)
      return 0;
    
    uint c = amount * parts;
    bool mulOverflow = (parts > 0 && c / amount != parts);

    // if mulOverflow, we do the division first instead of the multiplication
    // as we have the formula for percentage: percent = amount * parts / perX;
    if (mulOverflow)
      p = amount.div(perX).mul(parts);
    else p = amount.mul(parts).div(perX);
  }
}
