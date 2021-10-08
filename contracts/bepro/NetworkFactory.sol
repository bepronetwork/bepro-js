pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Network.sol";

/**
 * @title Development Network Contract Factory 
 */
contract NetworkFactory is ReentrancyGuard{
   using SafeMath for uint256;

    ERC20 public beproAddress; /* BEPRO ERC20 */
    uint256 public OPERATOR_AMOUNT = 1000000*10**18; // +1M
    uint256 public tokensLockedTotal = 0;
    uint256 public networksAmount = 0;

    mapping(address => uint256) public tokensLocked; /* Tokens Locked */
    mapping(uint256 => Network) public networks; /* Distribution Network Object Address */
    mapping(address => Network) public networksByAddress; /* Distribution Network Object Address */

    Network[] public networksArray; /* Array of Networks */

    event CreatedNetwork(uint256 indexed id, address indexed opener, uint256 indexed amount);

    constructor(ERC20 _beproAddress) public { 
        beproAddress = _beproAddress;
    }

    function lock(uint256 _tokenAmount) external {
        require(_tokenAmount > 0, "Token Amount needs to be higher than 0");
        require(beproAddress.transferFrom(msg.sender, address(this), _tokenAmount), "Needs Allowance");

        tokensLocked[msg.sender] = tokensLocked[msg.sender].add(_tokenAmount);
        tokensLockedTotal = tokensLockedTotal.add(_tokenAmount);
    }

    function createNetwork(address _settlerToken, address _transactionToken) external {

        require(tokensLocked[msg.sender] >= OPERATOR_AMOUNT, "Operator has to lock +1M BEPRO to fork the Network");

        Network network = new Network(_settlerToken, _transactionToken, msg.sender);
        networksArray.push(network);
        networks[networksAmount] = network;
        networksByAddress[msg.sender] = network;        
        networksAmount = networksAmount.add(1);
    }

    function unlock() external nonReentrant {
        require(tokensLocked[msg.sender] >= 0, "Needs to have tokens locked");
        require(beproAddress.transferFrom(address(this), msg.sender, tokensLocked[msg.sender]), "Needs Allowance");
        require(Network(networksByAddress[msg.sender]).oraclesStaked() == 0,"Network has to have 0 Settler Tokens");
        require(Network(networksByAddress[msg.sender]).totalStaked() == 0,"Network has to have 0 Transactional Tokens");

        tokensLockedTotal = tokensLockedTotal.sub(tokensLocked[msg.sender]);
        tokensLocked[msg.sender] = 0;
    }

    function getTokensLocked(address _address) external returns (uint256) {
        return tokensLocked[_address];
    }

    function getNetworkById(uint256 _id) external returns (address) {
        return address(networks[_id]);
    }

   function getNetworkByAddress(address _address) external returns (address) {
        return address(networksByAddress[_address]);
   }

}