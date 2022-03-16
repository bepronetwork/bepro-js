pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Network_v2.sol";



/// @title Development Network Contract Factory
contract NetworkFactory is ReentrancyGuard {
   using SafeMath for uint256;

    ERC20 public beproAddress; /* BEPRO ERC20 */
    uint256 public OPERATOR_AMOUNT = 1000000*10**18; // +1M
    uint256 public tokensLockedTotal = 0;
    uint256 public networksAmount = 0;

    mapping(address => uint256) public tokensLocked; /* Tokens Locked */
    mapping(uint256 => address) public networks; /* Distribution Network Object Address */
    mapping(address => address) public networksByAddress; /* Distribution Network Object Address, user address to network address mapping */

    Network_v2[] public networksArray; /* Array of Networks */

    /// @notice Network created event
    /// @param id New created Network id
    /// @param opener User address that created the Network
    /// @param amount BEPRO token amount locked for creating the Network
    event CreatedNetwork(uint256 indexed id, address indexed opener, uint256 indexed amount);



    /// @notice constructor
    /// @param _beproAddress BEPRO token address
    constructor(ERC20 _beproAddress) public {
        beproAddress = _beproAddress;
    }

    /// @notice user locks required amount of BEPRO tokens to create the Network,
    /// user needs to approve this contract to transferFrom BEPRO tokens on his behalf
    /// @param _tokenAmount BEPRO token amount
    function lock(uint256 _tokenAmount) external {
        require(_tokenAmount > 0, "Token Amount needs to be higher than 0");
        require(beproAddress.transferFrom(msg.sender, address(this), _tokenAmount), "Needs Allowance");

        tokensLocked[msg.sender] = tokensLocked[msg.sender].add(_tokenAmount);
        tokensLockedTotal = tokensLockedTotal.add(_tokenAmount);
    }

    /// @notice user creates Network, only one Network is allowed per user at a time
    /// @param _settlerToken Settler token address
    /// @param _bountyTokenName Bounty Token Name
    /// @param _bountyTokenSymbol Bounty Token Symbol
    /// @param _bountyNftUri Bounty NFT URI
    function createNetwork(
        address _settlerToken,
        address _nftTokenAddress,
        string memory _bountyTokenName,
        string memory _bountyTokenSymbol,
        string memory _bountyNftUri
    ) external payable {
        require(networksByAddress[msg.sender] == address(0), "Only one Network per user at a time");
        require(tokensLocked[msg.sender] >= OPERATOR_AMOUNT, "Operator has to lock +1M BEPRO to fork the Network");

        Network_v2 network = new Network_v2(_settlerToken, _nftTokenAddress, _bountyNftUri);
        network.proposeGovernor(msg.sender);
        networksArray.push(network);
        networks[networksAmount] = address(network);
        networksByAddress[msg.sender] = address(network);
        emit CreatedNetwork(networksAmount, msg.sender, tokensLocked[msg.sender]);
        networksAmount = networksAmount.add(1);
    }

    /// @notice user unlocks his BEPRO tokens
    function unlock() external nonReentrant {
        uint256 amount = tokensLocked[msg.sender];
        require(amount > 0, "Needs to have tokens locked");

        if (networksByAddress[msg.sender] != address(0)) {
            Network_v2 network = Network_v2(networksByAddress[msg.sender]);

            require(network.totalSettlerLocked() == 0, "Network has to have 0 Settler Tokens");
            require((network.closedBounties() + network.canceledBounties() ) == network.bountiesTotal(), "Network has to have 0 Open Bounties");
            networksByAddress[msg.sender] = address(0);
        }

        tokensLockedTotal = tokensLockedTotal.sub(amount);
        tokensLocked[msg.sender] = 0;
        require(beproAddress.transfer(msg.sender, amount), "TF"); //TF = transfer failed
    }

    /// @notice Get user's BEPRO tokens locked
    /// @param _address User address
    /// @return user's BEPRO tokens locked
    function getTokensLocked(address _address) external view returns (uint256) {
        return tokensLocked[_address];
    }

    /// @notice Get Network address given position in networks array
    /// @param _id Network id in the networks array
    /// @return Network address
    function getNetworkById(uint256 _id) external view returns (address) {
        return networks[_id];
    }

    /// @notice Get Network address given user address that created it
    /// @param _address User address
    /// @return Network address
    function getNetworkByAddress(address _address) external view returns (address) {
        return networksByAddress[_address];
    }
}
