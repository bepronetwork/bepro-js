// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./utils/Ownable.sol";

contract ERC20TokenLock is Pausable, Ownable {
    using SafeMath for uint256;
	
	IERC20 public erc20; //address of ERC20 token being held/locked by this contract
	
	uint256 public maxAmountToLock = 0; //max amount of tokens to lock per user
	
	uint256 public minAmountToLock = 0; //min amount of tokens to lock per user
	
	uint256 public totalAmountStaked = 0; //total tokens locked in contract
	
	mapping (address => lockedTokensInfo) public lockedTokensMap; //locked tokens map for all users
	
    struct lockedTokensInfo {
        uint256 startDate; //block.timestamp
        uint256 endDate;
        uint256 amount;
    }
	
	// tokens locked event
	event TokensLocked(address user, uint256 amount, uint256 startDate, uint256 endDate);
	
	// tokens released event
	event TokensReleased(address user, uint256 amount, uint256 withdrawDate);
    
	
	
    /**
     * @dev Constructor
	 */
    constructor(address _erc20TokenAddress) public {
		erc20 = IERC20(_erc20TokenAddress);
    }
	
	/**
     * @dev Returns the admin address, usually the contract owner address.
	 * @return address
     */
    function admin() public view returns (address) {
        return owner;
    }
	
	/**
     * @dev Admin sets maximum amount of tokens to lock per user.
	 * @param tokenAmount Maximum tokens amount.
	 * @return bool True if operation was successful.
     */
	function setMaxAmountToLock(uint256 tokenAmount) external onlyOwner returns (bool) {
		require(tokenAmount != maxAmountToLock, "Different token amount required");
		require(tokenAmount >= minAmountToLock, ">= minAmountToLock required");
		maxAmountToLock = tokenAmount;
		return true;
	}
	
	/**
     * @dev Admin sets minimum amount of tokens to lock per user.
	 * @param tokenAmount Minimum tokens amount.
	 * @return bool True if operation was successful.
     */
	function setMinAmountToLock(uint256 tokenAmount) external onlyOwner returns (bool) {
		require(tokenAmount != minAmountToLock, "Different token amount required");
		require(tokenAmount <= maxAmountToLock, "<= maxAmountToLock required");
		minAmountToLock = tokenAmount;
		return true;
	}
	
	/**
     * @dev User locks his tokens until specified end date.
	 * @param amount Tokens amount to be locked.
	 * @param endDate Lock tokens until this end date.
	 * @return bool True if operation was successful.
	 * REQUIREMENTS:
	 *	user must have approved this contract to spend the tokens "amount" he wants to lock before calling this function.
     */
	function lock(uint256 amount, uint256 endDate) external whenNotPaused returns (bool) {
		require(amount > 0 && amount >= minAmountToLock && amount <= maxAmountToLock, "Invalid token amount");
		require(endDate > block.timestamp, "Invalid end date");
		
		assert(lockedTokensMap[msg.sender].amount == 0); //otherwise user already locked tokens
		
		require(erc20.allowance(msg.sender, address(this)) >= amount, "Not enough tokens approved");
		require(erc20.transferFrom(msg.sender, address(this), amount), "transferFrom failed");
		
		lockedTokensMap[msg.sender].startDate = block.timestamp;
        lockedTokensMap[msg.sender].endDate = endDate;
        lockedTokensMap[msg.sender].amount = amount;
		
		totalAmountStaked = totalAmountStaked.add(amount);
		emit TokensLocked(msg.sender, amount, block.timestamp, endDate);
		return true;
	}
	
	/**
     * @dev User withdraws/releases his tokens after specified end date.
	 * @return bool True if operation was successful.
	 */
	function release() external returns (bool) {
		
		require(lockedTokensMap[msg.sender].amount > 0, "user has no locked tokens");
		require(lockedTokensMap[msg.sender].endDate <= block.timestamp, "tokens release date not reached");
		
		uint amount = lockedTokensMap[msg.sender].amount;
		lockedTokensMap[msg.sender].amount = 0;
		totalAmountStaked = totalAmountStaked.sub(amount);
		
		require(erc20.transfer(msg.sender, amount), "transfer failed");
		emit TokensReleased(msg.sender, amount, block.timestamp);
		return true;
	}
	
	/**
     * @dev Check if locked tokens release date has come and user can withdraw them
	 * @return bool True if lock end date was reached
	 */
	function canRelease(address user) external view returns (bool) {
		return (lockedTokensMap[user].endDate <= block.timestamp);
	}
	
	/**
     * @dev Get locked tokens amount for a given address
	 * @return uint256 Tokens amount for user address
	 */
	function getLockedTokens(address user) external view returns (uint256) {
		
		return lockedTokensMap[user].amount;
    }
	
    /// @dev Get locked tokens info for a given address
	/// @return startDate endDate amount Locked tokens info
	function getLockedTokensInfo(address user) external view returns (uint256 startDate, uint256 endDate, uint256 amount) {
		
		lockedTokensInfo memory info = lockedTokensMap[user];
        return (info.startDate, info.endDate, info.amount);
    }
	
}