// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./utils/Ownable.sol";

contract Opener is  Ownable {
    using SafeMath for uint256;

    ERC20 public _purchaseToken;
    address public _baseFeeAddress;
    address public _feeAddress;
    address public _otherAddress;
    bool public _isLimited = false;
    uint256 public _currentTokenId = 1000;
    uint256 public _limitedAmount;
    uint256 public _pricePerPack = 1*10**18;

    // Mapping from address to bool, if egg was already claimed
    // The hash is about the userId and the nftIds array
    mapping(address => mapping(uint256 => bool)) public registeredIDs;
    mapping(address => uint256[]) public registeredIDsArray;
    mapping(uint256 => bool) public alreadyMinted;

    event Opening(address indexed from, uint256 amount, uint256 openedPacks);

    uint256 public _baseFeeShare = 1;
    uint256 public _feeShare = 99;
    uint256 public _otherShare = 0;
    uint256 public MAX_PURCHASE = 10;

    bool public _closed = false;
    uint256 public _openedPacks = 0;

    constructor(
        ERC20 purchaseToken,
        address baseFeeAddress,
        address feeAddress,
        address otherAddress,
        uint256 limitedAmount
    ) public {
        _purchaseToken = purchaseToken;
        _baseFeeAddress = baseFeeAddress;
        _feeAddress = feeAddress;
        _otherAddress = otherAddress;
        if(limitedAmount != 0){
            _isLimited = true;
        }
        _limitedAmount = limitedAmount;
    }

    function _openPack(uint256 amount) internal {
        require(!_closed, "Opener is locked");
        uint256 totalPrice = _pricePerPack.mul(amount);

        require(_purchaseToken.allowance(msg.sender, address(this)) >= totalPrice, "Not enough money per pack");

        address from = msg.sender;

        require(amount <= MAX_PURCHASE, "Max purchase per tx reached");

        if(_isLimited){
            require(_limitedAmount >= _openedPacks.add(amount), "Amount of packs not available");
        }

        _distributePackShares(from, totalPrice);

        emit Opening(from, amount, _openedPacks);
        _openedPacks += amount;

        for(uint i = _currentTokenId; i < _currentTokenId.add(amount); i++){
            registeredIDs[msg.sender][i] = true;
            registeredIDsArray[msg.sender].push(i);
        }

        _currentTokenId += amount;
    }

    function _distributePackShares(address from, uint256 amount) internal {
        //transfer of fee share
        _purchaseToken.transferFrom(from, _baseFeeAddress, (amount * _baseFeeShare) / 100);

        if(address(_feeShare) != address(0)){
            //transfer of stake share
            _purchaseToken.transferFrom(
                from,
                _feeAddress,
                (amount * _feeShare) / 100
            );
        }

        if(address(_otherAddress) != address(0)){
            //transfer of stake share
            _purchaseToken.transferFrom(
                from,
                _otherAddress,
                (amount * _otherShare) / 100
            );
        }
    }

    function setShares(
        uint256 feeShare,
        uint256 otherShare
    ) public onlyOwner {
        require(
            otherShare + feeShare + _baseFeeShare == 100,
            "Doesn't add up to 100"
        );

        _otherShare = otherShare;
        _feeShare = feeShare;
    }


    function setPurchaseTokenAddress(ERC20 purchaseToken) public onlyOwner {
        _purchaseToken = purchaseToken;
    }

    function setPricePerPack(uint256 newPrice) public onlyOwner {
        _pricePerPack = newPrice;
    }

    function setFeeAddress(address feeAddress) public onlyOwner {
        _feeAddress = feeAddress;
    }

    function setOtherAddress(address otherAddress) public onlyOwner {
        _otherAddress = otherAddress;
    }

    function lock() public onlyOwner {
        _closed = true;
    }

    function unlock() public onlyOwner {
        _closed = false;
    }
}

// ERC721Standard made for a simple structure, owner generates himself the NFT he wants (direct minting)
contract ERC721Standard is ERC721, Ownable {

    constructor (string memory name, string memory symbol) public ERC721(name, symbol) { }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        _setTokenURI(tokenId, uri);
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }

    function mint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function mint(address to, uint256 tokenId, bytes memory _data) public onlyOwner {
        _safeMint(to, tokenId, _data);
    }
}

// ERC721Colectibles made for a Cryptokitties/Polkamon like structure, where an hash is given by the owner based on a purchase of a package
// Can be limited or unlimited
contract ERC721Colectibles is Opener, ERC721 {

    constructor (
        string memory name, string memory symbol,
        uint256 limitedAmount,
        ERC20 _purchaseToken,
        address baseFeeAddress,
        address feeAddress,
        address otherAddress) public ERC721(name, symbol) 
        Opener(_purchaseToken, baseFeeAddress, feeAddress, otherAddress, limitedAmount)
    {
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        _setTokenURI(tokenId, uri);
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }

    function mint(uint256 tokenIdToMint) public {
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