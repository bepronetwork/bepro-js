pragma solidity >=0.6.0 <=8.0.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Network_v2.sol";

pragma abicoder v2;

contract NetworkFactory_v2 is ReentrancyGuard  {
    using SafeMath for uint256;

    constructor(address erc20NetworkTokenAddress_) { erc20NetworkToken = erc20NetworkTokenAddress_; }

    address[] public networksArray;
    address public erc20NetworkToken;

    uint256 public creatorAmount = 1000000 * 10 ** 18;
    uint256 public tokensLocked = 0;
    uint256 public amountOfNetworks = 0;

    mapping(address => uint256) public lockedTokensOfAddress;
    mapping(address => address) public networkOfAddress;

    event NetworkCreated(address network, address indexed creator, uint256 id);
    event NetworkClosed(address indexed network);

    function manageFunds(bool lock, uint256 amount) public {
        if (lock) {
            require(amount > 0, "L0");
            require(ERC20(erc20NetworkToken).transferFrom(msg.sender, address(this), amount), "L1");

            lockedTokensOfAddress[msg.sender] = lockedTokensOfAddress[msg.sender].add(amount);
            tokensLocked = tokensLocked.add(amount);
        } else {
            uint256 lockedAmount = lockedTokensOfAddress[msg.sender];
            require(lockedAmount > 0, "UL0");

            if (networkOfAddress[msg.sender] != address(0)) {
                Network_v2 network = Network_v2(networkOfAddress[msg.sender]);
                require(network.totalSettlerLocked() == 0, "UL1");
                require((network.closedBounties() + network.canceledBounties()) == network.bountiesIndex() - 1, "UL2");
                emit NetworkClosed(networkOfAddress[msg.sender]);
                networkOfAddress[msg.sender] = address(0);
            }

            tokensLocked = tokensLocked.sub(lockedAmount);
            lockedTokensOfAddress[msg.sender] = 0;

            require(ERC20(erc20NetworkToken).transfer(msg.sender, lockedAmount));
        }
    }

    function createNetwork(address networkToken, address nftToken, string memory nftUri) public {
        require(networkOfAddress[msg.sender] == address(0), "CN1");
        require(lockedTokensOfAddress[msg.sender] >= creatorAmount, "CN2");

        Network_v2 network = new Network_v2(networkToken, nftToken, nftUri);
        network.proposeGovernor(msg.sender);
        networksArray.push(address(network));
        networkOfAddress[msg.sender] = address(network);
        amountOfNetworks = networksArray.length;
        emit NetworkCreated(address(network), msg.sender, networksArray.length - 1);
    }
}
