// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./ERC20CappedToken.sol";

/**
 * @title ERC20 Capped token
 * @dev ERC20 Mintable token with a token cap.
 */
contract ERC20Token is ERC20CappedToken {

    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _cap, 
        address _distributionContract)
        ERC20CappedToken(_name, _symbol, _cap, _distributionContract)
    {
    }
}
