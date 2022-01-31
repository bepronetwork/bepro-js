pragma solidity >=0.6.0;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
abstract contract Ownable {
    address public owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    constructor() {
        owner = msg.sender;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    * NOTE: Optimized by calling an internal function as modifiers are 'inlined'
    * and code is copy-pasted in target functions using them.
    */
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    // require current msg sender to be owner, reverts otherwise
    function _onlyOwner() internal view {
        require(msg.sender == owner, 'OR'); //Owner Required
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
