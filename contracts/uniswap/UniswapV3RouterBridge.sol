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

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/utils/EnumerableSet.sol";
//import "../../utils/Ownable.sol";
//import "../../utils/ReentrancyGuardOptimized.sol";
//import "../../math/SafePercentMath.sol";

/// @title UniswapV3 Router Bridge smart contract
abstract contract UniswapV3RouterBridge is Context {
  //, ReentrancyGuardOptimized {
    using SafeMath for uint256;
    //using SafePercentMath for uint256;

    //IUniswapV3Pool public immutable uniswapV3; //immutable
    ISwapRouter public immutable swapRouter;

    // we will set the pool fee to 0.3%.
    //uint24 public constant poolFee = 3000;
    
    //mapping(address => PoolInfo) pools; // pool exists toggles.
    //// Add the library methods
    //using EnumerableSet for EnumerableSet.AddressSet;
    //EnumerableSet.AddressSet private poolTokensList;

    constructor(
        //IUniswapV3Pool _uniswapV3
        ISwapRouter _swapRouter
    ) {
        
        //uniswapV3 = _uniswapV3;
        swapRouter = _swapRouter;
    }
    
    /// @notice swapExactInputSingle swaps a fixed amount of tokenIn for a maximum possible amount of tokenOut
    /// using the tokenIn/tokenOut 0.3% pool by calling `exactInputSingle` in the swap router.
    /// @dev The calling address must approve this contract to spend at least `amountIn` worth of its DAI for this function to succeed.
    /// @param tokenIn TokenIn address sender wants to exchange.
    /// @param tokenOut TokenOut address sender wants to get in exchange.
    /// @param poolFee Pool fee.
    /// @param from Tokens owner address we transfer tokens from to be exchanged.
    /// @param amountIn The exact amount of 'tokenIn' that will be swapped for 'tokenOut'.
    /// @param amountOutMinimum The minimum amount of 'amountOut' tokens that will be returned from the swap, this is used to prevent front running attacks,
    /// proviging a pre calculated expected minimum amount.
    /// @return amountOut The amount of 'tokenOut' received.
    function swapExactInputSingle(
      address tokenIn, address tokenOut, uint24 poolFee, 
      address from, uint256 amountIn, uint256 amountOutMinimum) 
      internal
      returns (uint256 amountOut) {
        // msg.sender 'from' address must approve this contract

        // Transfer the specified amount of 'tokenIn' to this contract.
        if (from != address(this))
            TransferHelper.safeTransferFrom(tokenIn, from, address(this), amountIn);
        
        // Approve the router to spend tokenIn.
        TransferHelper.safeApprove(tokenIn, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: from,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            });
        
        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    /// @notice swapExactOutputSingle swaps a minimum possible amount of 'tokenIn' for a fixed amount of 'tokenOut'.
    /// @dev The calling address must approve this contract to spend its 'tokenIn' for this function to succeed. As the amount of input 'tokenIn' is variable,
    /// the calling address will need to approve for a slightly higher amount, anticipating some variance.
    /// @param tokenIn TokenIn address sender wants to exchange.
    /// @param tokenOut TokenOut address sender wants to get in exchange.
    /// @param poolFee Pool fee.
    /// @param from Tokens owner address we transfer tokens from to be exchanged.
    /// @param amountOut The exact amount of 'tokenOut' to receive from the swap.
    /// @param amountInMaximum The amount of 'tokenIn' we are willing to spend to receive the specified amount of 'tokenOut'.
    /// @return amountIn The amount of 'tokenIn' actually spent in the swap.
    function swapExactOutputSingle(
      address tokenIn, address tokenOut, uint24 poolFee, 
      address from, uint256 amountOut, uint256 amountInMaximum) 
      internal 
      returns (uint256 amountIn) {
        // Transfer the specified amount of 'tokenIn' to this contract.
        bool differentFromTo = (from != address(this));
        if (differentFromTo)
            TransferHelper.safeTransferFrom(tokenIn, from, address(this), amountInMaximum);

        // Approve the router to spend the specifed `amountInMaximum` of 'tokenIn'.
        // In production, you should choose the maximum amount to spend based on oracles or other data sources to acheive a better swap.
        TransferHelper.safeApprove(tokenIn, address(swapRouter), amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params =
            ISwapRouter.ExactOutputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: from,
                deadline: block.timestamp,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });
        
        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = swapRouter.exactOutputSingle(params);

        // For exact output swaps, the amountInMaximum may not have all been spent.
        // If the actual amount spent (amountIn) is less than the specified maximum amount,
        // we must refund the msg.sender and approve the swapRouter to spend 0.
        if (amountIn < amountInMaximum) {
            TransferHelper.safeApprove(tokenIn, address(swapRouter), 0);
            // only send tokens if sender is external, if sender is current contract it already has the remaining tokens
            if (differentFromTo)
                TransferHelper.safeTransfer(tokenIn, _msgSender(), amountInMaximum - amountIn);
        }
    }
}
