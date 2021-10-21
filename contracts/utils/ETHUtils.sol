pragma solidity >=0.6.0 <0.8.0;
//pragma solidity =0.7.6;

//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IERC20View.sol";

/// @title Blockchain contract used for utilities such as:
/// -read ERC20 functions on the fly
/// -read block attributes from the blockchain
contract ETHUtils {
    
    /// @notice constructor
    constructor() { }

    /// @notice Get token name given token address.
    /// @dev This is an utility function for DApp layer.
    /// @param tokenAddress The token address.
    /// @return token name.
    function name(address tokenAddress) external view returns (string memory) {
      return IERC20View(tokenAddress).name();
    }

    /// @notice Get token symbol given token address.
    /// @dev This is an utility function for DApp layer.
    /// @param tokenAddress The token address.
    /// @return token symbol.
    function symbol(address tokenAddress) external view returns (string memory) {
      return IERC20View(tokenAddress).symbol();
    }

    /// @notice Get token decimals given token address.
    /// @dev This is an utility function for DApp layer when converting to float numbers.
    /// @param tokenAddress The token address.
	  /// @return token decimals.
    function decimals(address tokenAddress) external view returns (uint8) {
      return IERC20View(tokenAddress).decimals();
    }

    /// @notice get current block number
    /// @return current block number
    function blockNumber() external view returns (uint256) {
        return block.number;
    }

    /// @notice Get current block timestamp
    /// @return current block timestamp
    function blockTimestamp() external view returns (uint256) {
      return block.timestamp;
    }

    /// @notice get current block number and timestamp
    /// @return current block number
    /// @return current block timestamp
    function blockNumberAndTimestamp() external view returns (uint256, uint256) {
      return (block.number, block.timestamp);
    }
}
