// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./utils/Ownable.sol";
import "./ERC721Mintable.sol";

// ERC721Standard made for a simple structure, owner can generates himself the NFT he wants (direct minting).
abstract contract ERC721Base is Ownable, ERC721 { //, ERC721Mintable {

    constructor (string memory name, string memory symbol) ERC721(name, symbol)
    {
    }

    function exists(uint256 tokenId) external virtual view returns (bool) {
        return _exists(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory uri) external virtual onlyOwner {
        _setTokenURI(tokenId, uri);
    }

    function setBaseURI(string memory baseURI) external virtual onlyOwner {
        _setBaseURI(baseURI);
    }

    /*function mint(address to, uint256 tokenId) external virtual onlyOwner {
        _safeMint(to, tokenId);
    }

    function mint(address to, uint256 tokenId, bytes memory _data) external virtual onlyOwner {
        _safeMint(to, tokenId, _data);
    }*/
}