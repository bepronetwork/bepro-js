// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./utils/Ownable.sol";

/**
 * @title ERC721 Mintable Token
 * @dev ERC721 Token that can be minted.
 */
abstract contract ERC721Mintable is Ownable, ERC721 {
    
    /**
     * @dev Mints `tokenId`. See {ERC721-_safeMint}.
     */
    function mint(address to, uint256 tokenId) external virtual onlyOwner {
        _safeMint(to, tokenId);
    }

    /**
     * @dev Mints `tokenId`. See {ERC721-_safeMint}.
     */
    function mint(address to, uint256 tokenId, bytes memory _data) external virtual onlyOwner {
        _safeMint(to, tokenId, _data);
    }
}
