pragma solidity >=0.6.0;

import "./ERC20.sol";

/**
 * @title ERC20 test token contract
 * @dev Mintable token with a token cap having msg.sender as distributionContract address.
 */
contract ERC20Test is Token {

    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _cap
        ) public Token(_name, _symbol, _cap, msg.sender) {
    }
}