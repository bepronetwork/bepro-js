// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./utils/Ownable.sol";

// File: openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol

/**
 * @title Capped token
 * @dev Mintable token with a token cap.
 */
contract ERC20CappedToken is ERC20, Ownable {

    address public distributionContract;

    constructor(       
        string memory _name, 
        string memory _symbol,
        uint256 _cap, address _distributionContract)
        ERC20(_name, _symbol)
    {
        _mint(_distributionContract, _cap);
    }

}
