// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./ERC20Token.sol";
import "./lifecycle/MinterRole.sol";

/**
 * @title ERC20 token Liquidity Mining contract
 * @dev This contract has 'minter' roles enabled so another smart contract can mint tokens and distribute them as rewards
 * after some successful function calls.
 * @notice Based on "@openzeppelin\contracts\presets\ERC20PresetMinterPauser.sol"
 */
contract ERC20Minter is ERC20Token, MinterRole {

    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _cap)
        ERC20Token(_name, _symbol, _cap, msg.sender)
        MinterRole()
    {
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     *
     * See {ERC20-_mint}.
     *
     * Requirements:
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(address to, uint256 amount) public virtual minterRequired {
        _mint(to, amount);
    }
}
