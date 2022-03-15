// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../utils/Ownable.sol";

contract RealFevrOpener is  Ownable, ERC721 {

    using SafeMath for uint256;

    ERC20 public _purchaseToken;
    // Mapping from address to bool, if egg was already claimed
    // The hash is about the userId and the nftIds array
    mapping(address => mapping(uint256 => bool)) public registeredIDs;
    mapping(address => uint256[]) public registeredIDsArray;
    mapping(uint256 => bool) public alreadyMinted;

    mapping(uint256 => Pack) public packs;
    mapping(uint256 => MarketplaceDistribution) private marketplaceDistributions;

    uint256 public packIncrementId = 1;
    uint256 public lastNFTID = 1;

    event PackCreated(uint256 packId, string indexed serie, string indexed packType, string indexed drop);
    event PackBought(address indexed by, uint256 indexed packId);
    event PackOpened(address indexed by, uint256 indexed packId);
    event PackDelete(uint256 indexed packId);
    event NftMinted(uint256 indexed nftId);

    uint256 public _realFvrTokenPriceUSD = 0;

    bool public _closed = false;
    uint256 public _openedPacks = 0;

    struct Pack {
        uint256 packId;
        uint256 nftAmount;
        uint256 initialNFTId;
        uint256 saleStart;
        uint256[] saleDistributionAmounts;
        address[] saleDistributionAddresses;
        // Marketplace
        // Catalog info
        uint256 price; // in usd (1 = $0.000001)
        string serie;
        string drop;
        string packType;
        bool opened;
        //external info
        address buyer;
    }

    struct MarketplaceDistribution {
        uint256[] marketplaceDistributionAmounts;
        address[] marketplaceDistributionAddresses;
    }

    constructor (string memory name, string memory symbol, ERC20 purchaseToken) public ERC721(name, symbol) {}

    function _distributePackShares(address from, uint256 packId, uint256 amount) internal {
        //transfer of fee share
        Pack memory pack = packs[packId];

        for(uint i = 0; i < pack.saleDistributionAddresses.length; i++){
            //transfer of stake share
            _purchaseToken.transferFrom(
                from,
                pack.saleDistributionAddresses[i],
                (pack.saleDistributionAmounts[i] * amount) / 100
            );
        }
    }

    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        _setTokenURI(tokenId, uri);
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }


    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function getRegisteredIDs(address _address) public view returns(uint256[] memory) {
        return registeredIDsArray[_address];
    }

    function getPackbyId(uint256 _packId) public returns (uint256,  uint256, uint256, string memory, string memory, string memory, address,
        address[] memory, uint256[] memory, bool)  {
        Pack memory pack = packs[_packId];
        return (
            pack.packId, pack.initialNFTId, pack.price, pack.serie, pack.drop, pack.packType, pack.buyer,
            pack.saleDistributionAddresses, pack.saleDistributionAmounts, pack.opened);
    }

    function getMarketplaceDistributionForERC721(uint256 _tokenId) public view returns(uint256[] memory, address[] memory) {
        return (marketplaceDistributions[_tokenId].marketplaceDistributionAmounts, marketplaceDistributions[_tokenId].marketplaceDistributionAddresses);
    }

    function getPackPriceInFVR(uint256 packId) public returns (uint256) {
        return packs[packId].price.mul(_realFvrTokenPriceUSD).div(10**3);
    }

    function buyPack(uint256 packId) public {
        require(!_closed, "Opener is locked");
        require(packs[packId].buyer == address(0), "Pack was already bought");
        require(packs[packId].price != 0, "Pack has to exist");

        uint256 price = getPackPriceInFVR(packId);

        require(_purchaseToken.allowance(msg.sender, address(this)) >= price, "First you have to allow the use of the tokens by the Opener, use allow function");

        address from = msg.sender;

        _distributePackShares(from, packId, price);

        _openedPacks += 1;

        for(uint i = 0; i < packs[packId].nftAmount; i++){
            registeredIDs[msg.sender][packs[packId].initialNFTId+i] = true;
            registeredIDsArray[msg.sender].push(i);
        }

        packs[packId].buyer = from;

        emit PackBought(from, packId);
    }

    function buyPacks(uint256[] memory packIds) public {
        for(uint i = 0; i < packIds.length; i++){
            buyPack(packIds[i]);
        }
    }

    function openPack(uint256 packId) public {
        require(!_closed, "Opener is locked");
        require(!packs[packId].opened, "Opened Already");
        require(packs[packId].buyer != address(0), "Pack was not bought");
        require(packs[packId].buyer == msg.sender, "You were not the pack buyer");

        packs[packId].opened = true;

        emit PackOpened(msg.sender, packId);
    }

    function openPacks(uint256[] memory packIds) public {
        for(uint i = 0; i < packIds.length; i++){
            openPack(packIds[i]);
        }
    }

    function createPack(uint256 nftAmount, uint256 price /* 1 = ($1) */,
        string memory serie, string memory packType, string memory drop, uint256 saleStart,
        address[] memory saleDistributionAddresses,  uint256[] memory saleDistributionAmounts, /* [1;98;1]*/
        address[] memory marketplaceDistributionAddresses,  uint256[] memory marketplaceDistributionAmounts /* [1;98;1]*/
    ) public onlyOwner {

        require(saleDistributionAmounts.length == saleDistributionAddresses.length, "saleDistribution Lenghts are not the same");
        uint256 totalFees = 0;
        for(uint i = 0; i < saleDistributionAddresses.length; i++){
            totalFees += saleDistributionAmounts[i];
        }
        require(totalFees == 100, "Sum of all amounts has to equal 100");


        require(marketplaceDistributionAddresses.length == marketplaceDistributionAmounts.length, "marketplaceDistribution Lenghts are not the same");

        Pack memory pack;
        pack.packId = packIncrementId;
        pack.nftAmount = nftAmount;
        pack.saleStart = saleStart;
        pack.initialNFTId = lastNFTID;
        pack.price = price;
        pack.serie = serie;
        pack.drop = drop;
        pack.saleDistributionAddresses = saleDistributionAddresses;
        pack.saleDistributionAmounts = saleDistributionAmounts;
        pack.packType = packType;
        packs[packIncrementId] = pack;


        for(uint j = 1; j <= nftAmount; j++){
            // Marketplace Distributions
            MarketplaceDistribution memory marketplaceDistribution = MarketplaceDistribution(marketplaceDistributionAmounts, marketplaceDistributionAddresses);
            marketplaceDistributions[lastNFTID+j] = marketplaceDistribution;
        }

        emit PackCreated(packIncrementId, serie, packType, drop);
        lastNFTID = lastNFTID + nftAmount;
        packIncrementId = packIncrementId+1;
    }

     function offerPack(uint256 packId, address receivingAddress) public onlyOwner {
        require(packs[packId].packId == packId, "Pack does not exist");
        Pack memory pack = packs[packId];
        packs[packId].buyer = receivingAddress;

        _openedPacks += 1;

        for(uint i = 0; i < packs[packId].nftAmount; i++){
            registeredIDs[receivingAddress][packs[packId].initialNFTId+i] = true;
            registeredIDsArray[receivingAddress].push(i);
        }
        emit PackBought(receivingAddress, packId);
    }

    function editPackInfo(uint256 _packId, uint256 _saleStart, string memory serie, string memory packType, string memory drop, uint256 price) public onlyOwner {
        require(block.timestamp < packs[_packId].saleStart, "Sale is already live");
        packs[_packId].saleStart = _saleStart;
        packs[_packId].serie = serie;
        packs[_packId].packType = packType;
        packs[_packId].drop = drop;
        packs[_packId].price = price;
    }

    function deletePackById(uint256 packId) public onlyOwner {
        require(block.timestamp < packs[packId].saleStart, "Sale is already live");
        delete packs[packId];
        emit PackDelete(packId);
    }

    function mint(uint256 tokenIdToMint) public {
        require(registeredIDs[msg.sender][tokenIdToMint], "Token was not registered or not the rightful owner");
        require(!alreadyMinted[tokenIdToMint], "Already minted");

        alreadyMinted[tokenIdToMint] = true;
        _safeMint(msg.sender, tokenIdToMint);
        emit NftMinted(tokenIdToMint);
    }

    function setPurchaseTokenAddress(ERC20 purchaseToken) public onlyOwner {
        _purchaseToken = purchaseToken;
    }

    function setTokenPriceInUSD(uint256 newPrice /* 1*10e18 -> 1 FVR = $1; 1*10e17 -> 0.1 FVR = $1  */) public onlyOwner {
        require(newPrice != 0, "newPrice has to higher than 0");
        _realFvrTokenPriceUSD = newPrice;
    }

    function lock() public onlyOwner {
        _closed = true;
    }

    function unlock() public onlyOwner {
        _closed = false;
    }
}
