pragma solidity >=0.6.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../utils/Governed.sol";

contract BountyToken is ERC721, Governed {

    struct BountyConnector {
        uint256 bountyId;
        uint percentage; // 0 - 100
        // todo add if proposer, dev, or closer
    }

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Governed() {}

    BountyConnector[] tokenIds;

    function awardBounty(address to, string memory uri, uint256 bountyId, uint percentage) public payable onlyGovernor {
        uint256 id = tokenIds.length;
        _safeMint(to, id);
        _setTokenURI(id, uri);
        tokenIds.push(BountyConnector(bountyId, percentage));
    }

    function getBountyToken(uint256 id) public view returns (BountyConnector memory bountyConnector) {
        require(tokenIds.length <= id, "Bounty token does not exist");
        return tokenIds[id];
    }
}
