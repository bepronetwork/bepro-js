pragma solidity >=6.0.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../utils/Governed.sol";

contract BountyToken is Governed, ERC721 {

    struct BountyConnector {
        uint256 bountyId;
        uint percentage; // 0 - 100
    }

    BountyToken[] tokenIds;

    function awardBounty(address to, string memory uri, uint256 bountyId, uint percentage) public payable onlyGovernor {
        uint256 memory id = tokenIds.length;
        _safeMint(to, id);
        _setTokenURI(id, uri);
        tokenIds.push(BountyToken(bountyId, percentage));
    }

    function getBounty(uint256 id) public view returns (BountyToken) {
        require(tokenIds.length <= id, "Bounty token does not exist");
        return tokenIds[id];
    }
}
