// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";
import "./PauserRoleWithoutRenounce.sol";

/**
 * @title PausableWithoutRenounce
 * @author Sablier
 * @notice Fork of OpenZeppelin's Pausable, a contract module which allows children to implement an
 *  emergency stop mechanism that can be triggered by an authorized account, but with the `renouncePauser`
 *  function removed to avoid fat-finger errors.
 *  We inherit from `Context` to keep this contract compatible with the Gas Station Network.
 * See https://github.com/OpenZeppelin/openzeppelin-contracts-ethereum-package/blob/master/contracts/lifecycle/Pausable.sol
 * See https://docs.openzeppelin.com/contracts/2.x/gsn#_msg_sender_and_msg_data
 */
contract PausableWithoutRenounce is Initializable, Context, PauserRoleWithoutRenounce {
    /**
     * @dev Emitted when the pause is triggered by a pauser (`account`).
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by a pauser (`account`).
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state. Assigns the Pauser role
     * to the deployer.
     */
    function initialize(address sender) public override initializer {
        PauserRoleWithoutRenounce.initialize(sender);
        _paused = false;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     * NOTE: Optimized by calling an internal function as modifiers are 'inlined'
     * and code is copy-pasted in target functions using them.
     */
    modifier whenNotPaused() {
        _whenNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     * NOTE: Optimized by calling an internal function as modifiers are 'inlined'
     * and code is copy-pasted in target functions using them.
     */
    modifier whenPaused() {
        _whenPaused();
        _;
    }

    function _whenNotPaused() internal view {
        require(!_paused, "Pausable: paused");
    }

    function _whenPaused() internal view {
        require(_paused, "Pausable: not paused");
    }

    /**
     * @dev Called by a pauser to pause, triggers paused state.
     */
    function pause() public onlyPauser whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Called by a pauser to unpause, returns to normal state.
     */
    function unpause() public onlyPauser whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}
