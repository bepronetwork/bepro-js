// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title Minter role smart contract
 * @dev This contract has 'minter' role management and is to be included
 * in any contract requiring minter role for ERC20 token minting operations.
 */
abstract contract MinterRole is Context, AccessControl {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    constructor()
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
    }

    /**
    * @dev Throws if called by any account other than user with 'minter' role.
    * NOTE: Optimized by calling an internal function as modifiers are 'inlined'
    * and code is copy-pasted in target functions using them.
    */
    modifier minterRequired() {
        _minterRequired();
        _;
    }

    // require current msg sender to have 'minter' role, reverts otherwise
    function _minterRequired() internal view {
        require(hasRole(MINTER_ROLE, _msgSender()), "MinterRole: minter role required");
    }
}
