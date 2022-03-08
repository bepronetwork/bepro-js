// SPDX-License-Identifier: MIT
//pragma solidity >=0.6.0 <0.8.0;
pragma solidity =0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

import "../utils/ReentrancyGuardOptimized.sol";
import "./UniswapV3RouterBridge.sol";
//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/utils/EnumerableSet.sol";
//import "../utils/Ownable.sol";
//import "../../math/SafePercentMath.sol";

/// @title UniswapV3 Router Bridge smart contract for external calls
contract TestUniswapV3RouterBridge is UniswapV3RouterBridge, ReentrancyGuardOptimized {
    constructor(
        ISwapRouter _swapRouter
    ) UniswapV3RouterBridge(_swapRouter) {
    }
    
    /// @notice swapExactInputSingle swaps a fixed amount of tokenIn for a maximum possible amount of tokenOut
    /// using the tokenIn/tokenOut 0.3% pool by calling `exactInputSingle` in the swap router.
    /// @dev The calling address must approve this contract to spend at least `amountIn` worth of its DAI for this function to succeed.
    /// @param tokenIn TokenIn address sender wants to exchange.
    /// @param tokenOut TokenOut address sender wants to get in exchange.
    /// @param poolFee Pool fee.
    /// @param amountIn The exact amount of 'tokenIn' that will be swapped for 'tokenOut'.
    /// @param amountOutMinimum The minimum amount of 'amountOut' tokens that will be returned from the swap, this is used to prevent front running attacks,
    /// proviging a pre calculated expected minimum amount.
    /// @return amountOut The amount of 'tokenOut' received.
    function swapExactInputSingleEx(
      address tokenIn, address tokenOut, uint24 poolFee, 
      uint256 amountIn, uint256 amountOutMinimum)
      external
      nonReentrant
      returns (uint256 amountOut) {
        // msg.sender must approve this contract
        return swapExactInputSingle(tokenIn, tokenOut, poolFee, _msgSender(), amountIn, amountOutMinimum);
    }

    /// @notice swapExactOutputSingle swaps a minimum possible amount of 'tokenIn' for a fixed amount of 'tokenOut'.
    /// @dev The calling address must approve this contract to spend its 'tokenIn' for this function to succeed. As the amount of input 'tokenIn' is variable,
    /// the calling address will need to approve for a slightly higher amount, anticipating some variance.
    /// @param tokenIn TokenIn address sender wants to exchange.
    /// @param tokenOut TokenOut address sender wants to get in exchange.
    /// @param poolFee Pool fee.
    /// @param amountOut The exact amount of 'tokenOut' to receive from the swap.
    /// @param amountInMaximum The amount of 'tokenIn' we are willing to spend to receive the specified amount of 'tokenOut'.
    /// @return amountIn The amount of 'tokenIn' actually spent in the swap.
    function swapExactOutputSingleEx(
      address tokenIn, address tokenOut, uint24 poolFee, 
      uint256 amountOut, uint256 amountInMaximum)
      external
      nonReentrant
      returns (uint256 amountIn) {
        return swapExactOutputSingle(tokenIn, tokenOut, poolFee, _msgSender(), amountOut, amountInMaximum);
    }
}
