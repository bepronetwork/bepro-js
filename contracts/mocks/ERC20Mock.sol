// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20 Mock
 * @dev Mock class using ERC20
 * based on Sablier's ERC20Mock contract
 */
contract ERC20Mock is ERC20 {
	
	constructor() public ERC20("ERC20Mock", "erc20mock") {
    }
	
    /**
     * @dev Allows anyone to mint tokens to any address
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
