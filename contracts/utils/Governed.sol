// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;


/**
 * @title Governed
 * @dev The Governable contract has an governor smart contract address, and provides basic authorization control
 * functions, this simplifies the implementation of "gov permissions".
 */
abstract contract Governed {
    address public _proposedGovernor;
    address public _governor;
    event GovernorTransferred(address indexed previousGovernor, address indexed newGovernor);


    /**
    * @dev The Ownable constructor sets the original `governor` of the contract to the sender
    * account.
    */
    constructor() {
        _governor = msg.sender;
    }

    /**
    * @dev Throws if called by any account other than the governor.
    * NOTE: Optimized by calling an internal function as modifiers are 'inlined'
    * and code is copy-pasted in target functions using them.
    */
    modifier onlyGovernor() {
        _onlyGovernor();
        _;
    }

    // require current msg sender to be governor, reverts otherwise
    function _onlyGovernor() internal view {
        require(msg.sender == _governor, 'GR'); //Governor Required
    }

    function proposeGovernor(address proposedGovernor) public onlyGovernor {
        require(msg.sender != proposedGovernor, 'IPG'); //Invalid Proposed Governor
        _proposedGovernor = proposedGovernor;
    }
    
    function claimGovernor() public {
        require(msg.sender == _proposedGovernor, 'PGR'); //Proposed Governor Required
        emit GovernorTransferred(_governor, _proposedGovernor);
        _governor = _proposedGovernor;
        _proposedGovernor = address(0);
    }
 
}
