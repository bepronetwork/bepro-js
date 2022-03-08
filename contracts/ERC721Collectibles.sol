// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./utils/Ownable.sol";
import "./Opener.sol";
import "./ERC721Base.sol";

// ERC721Colectibles made for a Cryptokitties/Polkamon like structure, where an hash is given by the owner based on a purchase of a package
// Can be limited or unlimited
contract ERC721Collectibles is Opener, ERC721Base { //ERC721 {

    constructor (
        string memory name, string memory symbol,
        uint256 limitedAmount,
        ERC20 _purchaseToken,
        address baseFeeAddress,
        address feeAddress,
        address otherAddress)
        ERC721Base(name, symbol) 
        Opener(_purchaseToken, baseFeeAddress, feeAddress, otherAddress, limitedAmount)
    {
    }

    /*function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }*/

    /*function setTokenURI(uint256 tokenId, string memory uri) external virtual override onlyOwner {
        _setTokenURI(tokenId, uri);
    }*/

    /*function setBaseURI(string memory baseURI) external virtual override onlyOwner {
        _setBaseURI(baseURI);
    }*/

    /*function mint(address to, uint256 tokenId) external virtual override {
        revert("Implementation not allowed");
        //_safeMint(to, tokenId);
    }

    function mint(address to, uint256 tokenId, bytes memory _data) external virtual override {
        revert("Implementation not allowed");
        //_safeMint(to, tokenId, _data);
    }*/

    function mint(uint256 tokenIdToMint) external virtual {
        require(
            tokenIdToMint <= _currentTokenId, 
            "Token Id not registered"
        );

        require(registeredIDs[msg.sender][tokenIdToMint], "Token was not registered or not the rightful owner");
        require(!alreadyMinted[tokenIdToMint], "Already minted");

        alreadyMinted[tokenIdToMint] = true;
        _safeMint(msg.sender, tokenIdToMint);
    }

    function openPack(uint256 amount) public {
        _openPack(amount);
    }

    function getRegisteredIDs(address _address) public view returns(uint256[] memory) {
        return registeredIDsArray[_address];
    }
}