pragma solidity >=0.6.0;


/**
 * @title Governed
 * @dev The Governable contract has an governor smart contract address, and provides basic authorization control
 * functions, this simplifies the implementation of "gov permissions".
 */
contract Governed {
    address public _governor;
    event GovernorTransferred(address indexed previousGovernor, address indexed newGovernor);


    /**
    * @dev The Ownable constructor sets the original `governor` of the contract to the sender
    * account.
    */
    constructor() public {
        _governor = msg.sender;
    }

    /**
    * @dev Throws if called by any account other than the governor.
    */
    modifier onlyGovernor() {
        require(msg.sender == _governor);
        _;
    }

    /**
    * @dev Allows the current governor to transfer control of the contract to a newGovernor.
    * @param newGovernor The address to transfer governorship to.
    */
    function transferGovernor(address newGovernor) public onlyGovernor {
        require(newGovernor != address(0));
        emit GovernorTransferred(newGovernor, newGovernor);
        _governor = newGovernor;
    }
 
}
