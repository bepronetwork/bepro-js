// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./utils/Ownable.sol";
import "./ERC721Base.sol";
import "./ERC721Mintable.sol";

// ERC721Standard made for a simple structure, owner generates himself the NFT he wants (direct minting)
contract ERC721Standard is Ownable, ERC721Base, ERC721Mintable { //ERC721 {

    constructor (string memory name, string memory symbol) ERC721Base(name, symbol)
    {
    }

    /*function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }*/

    /*function setTokenURI(uint256 tokenId, string memory uri) external virtual override onlyOwner {
        _setTokenURI(tokenId, uri);
    }

    function setBaseURI(string memory baseURI) external virtual override onlyOwner {
        _setBaseURI(baseURI);
    }

    function mint(address to, uint256 tokenId) external virtual override onlyOwner {
        _safeMint(to, tokenId);
    }

    function mint(address to, uint256 tokenId, bytes memory _data) external virtual override onlyOwner {
        _safeMint(to, tokenId, _data);
    }*/
}