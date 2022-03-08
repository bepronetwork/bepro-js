// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";
import "./Roles.sol";

/**
 * @title PauserRoleWithoutRenounce
 * @author Sablier
 * @notice Fork of OpenZeppelin's PauserRole, but with the `renouncePauser` function removed to avoid fat-finger errors.
 *  We inherit from `Context` to keep this contract compatible with the Gas Station Network.
 * See https://github.com/OpenZeppelin/openzeppelin-contracts-ethereum-package/blob/master/contracts/access/roles/PauserRole.sol
 */

contract PauserRoleWithoutRenounce is Initializable, Context {
    using Roles for Roles.Role;

    event PauserAdded(address indexed account);
    event PauserRemoved(address indexed account);

    Roles.Role private _pausers;

    function initialize(address sender) public virtual initializer {
        if (!isPauser(sender)) {
            _addPauser(sender);
        }
    }

    /**
     * @dev Throws if called by any account other than the pauser.
     * NOTE: Optimized by calling an internal function as modifiers are 'inlined'
     * and code is copy-pasted in target functions using them.
     */
    modifier onlyPauser() {
        _onlyPauser();
        _;
    }

    function _onlyPauser() internal view {
        require(isPauser(_msgSender()), "PauserRole: caller does not have the Pauser role");
    }

    function isPauser(address account) public view returns (bool) {
        return _pausers.has(account);
    }

    function addPauser(address account) public onlyPauser {
        _addPauser(account);
    }

    function _addPauser(address account) internal {
        _pausers.add(account);
        emit PauserAdded(account);
    }

    function _removePauser(address account) internal {
        _pausers.remove(account);
        emit PauserRemoved(account);
    }

    uint256[50] private ______gap;
}
