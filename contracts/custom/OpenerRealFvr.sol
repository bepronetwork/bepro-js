// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
//import "../IERC20Events.sol";
import "./IOpenerRealFvr.sol";
import "../utils/Ownable.sol";
import "../ERC721Base.sol";

contract OpenerRealFvr is Ownable, IOpenerRealFvr, ERC721Base {

    using SafeMath for uint256;

    ERC20 public purchaseToken;
    // Mapping from address to bool, if egg was already claimed
    // The hash is about the userId and the nftIds array
    mapping(address => mapping(uint256 => bool)) public registeredIDs;
    mapping(address => uint256[]) public registeredIDsArray;
    mapping(uint256 => bool) public alreadyMinted;
    
    mapping(uint256 => Pack) public packs;
    mapping(uint256 => MarketplaceDistribution) private marketplaceDistributions;

    uint256 public nextPackId = 0;
    uint256 public nextNFTID = 0;

    uint256 public realFvrTokenPriceUSD = 0;

    bool public closed = false;
    uint256 public openedPacks = 0;

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
  
    constructor (string memory _name, string memory _symbol, ERC20 _purchaseToken)
        public ERC721Base(_name, _symbol)
    {
        purchaseToken = _purchaseToken;
    }

    function _distributePackShares(address from, uint256 packId, uint256 amount) internal {
        //transfer of fee share
        Pack memory pack = packs[packId];

        for (uint i = 0; i < pack.saleDistributionAddresses.length; i++) {
            //transfer of stake share
            purchaseToken.transferFrom(
                from,
                pack.saleDistributionAddresses[i],
                (pack.saleDistributionAmounts[i] * amount) / 100
            );
        }
    }

    /*function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        _setTokenURI(tokenId, uri);
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }


    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }*/
    
    function getRegisteredIDs(address _address) external override view returns(uint256[] memory) {
        return registeredIDsArray[_address];
    }

    function getPackbyId(uint256 packId) external override returns (
        uint256,  uint256, uint256, string memory, string memory, string memory, address, 
        address[] memory, uint256[] memory, bool)
    {
        Pack storage pack = packs[packId];
        return (
            pack.packId, pack.initialNFTId, pack.price, pack.serie, pack.drop, pack.packType, pack.buyer,
            pack.saleDistributionAddresses, pack.saleDistributionAmounts, pack.opened);
    }

    function getMarketplaceDistributionForERC721(uint256 _tokenId) external override view
        returns(uint256[] memory, address[] memory)
    {
        return (marketplaceDistributions[_tokenId].marketplaceDistributionAmounts,
            marketplaceDistributions[_tokenId].marketplaceDistributionAddresses);
    }

    function getPackPriceInFVR(uint256 packId) public override returns (uint256) {
        return packs[packId].price.mul(realFvrTokenPriceUSD).div(10**3);
    }

    function buyPack(uint256 packId) public override {
        require(!closed, "Opener is locked");
        require(packs[packId].buyer == address(0), "Pack was already bought");
        require(packs[packId].price != 0, "Pack has to exist");

        uint256 price = getPackPriceInFVR(packId);

        require(purchaseToken.allowance(msg.sender, address(this)) >= price, "First you have to allow the use of the tokens by the Opener, use allow function");

        address from = msg.sender;

        _distributePackShares(from, packId, price);

        openedPacks += 1;

        for(uint i = 0; i < packs[packId].nftAmount; i++) {
            registeredIDs[msg.sender][packs[packId].initialNFTId+i] = true;
            registeredIDsArray[msg.sender].push(i);
        }

        packs[packId].buyer = from;

        emit PackBought(from, packId);
    }

    function buyPacks(uint256[] memory packIds) external override {
        for(uint i = 0; i < packIds.length; i++) {
            buyPack(packIds[i]);
        }
    }

    function openPack(uint256 packId) public override {
        require(!closed, "Opener is locked");
        require(!packs[packId].opened, "Opened Already");
        require(packs[packId].buyer != address(0), "Pack was not bought");
        require(packs[packId].buyer == msg.sender, "You were not the pack buyer");

        packs[packId].opened = true;
        
        emit PackOpened(msg.sender, packId);
    }

    function openPacks(uint256[] memory packIds) external override {
        for(uint i = 0; i < packIds.length; i++) {
            openPack(packIds[i]);
        }
    }

    function createPack(uint256 nftAmount, uint256 price /* 1 = ($1) */, 
        string memory serie, string memory packType, string memory drop, uint256 saleStart,
        address[] memory saleDistributionAddresses,  uint256[] memory saleDistributionAmounts, /* [1;98;1]*/
        address[] memory marketplaceDistributionAddresses,  uint256[] memory marketplaceDistributionAmounts /* [1;98;1]*/
    ) external override onlyOwner {

        require(saleDistributionAmounts.length == saleDistributionAddresses.length, "saleDistribution Lenghts are not the same");
        require(marketplaceDistributionAddresses.length == marketplaceDistributionAmounts.length, "marketplaceDistribution Lenghts are not the same");
        
        uint256 totalFees = 0;
        for(uint i = 0; i < saleDistributionAddresses.length; i++) {
            totalFees += saleDistributionAmounts[i];
        }
        require(totalFees == 100, "Sum of all amounts has to equal 100");

        Pack memory pack;
        pack.packId = nextPackId;
        pack.nftAmount = nftAmount;
        pack.saleStart = saleStart;
        pack.initialNFTId = nextNFTID;
        pack.price = price;
        pack.serie = serie;
        pack.drop = drop;
        pack.saleDistributionAddresses = saleDistributionAddresses;
        pack.saleDistributionAmounts = saleDistributionAmounts;
        pack.packType = packType;
        packs[nextPackId] = pack;

        for(uint j = 0; j < nftAmount; j++) {
            // Marketplace Distributions
            MarketplaceDistribution memory marketplaceDistribution = MarketplaceDistribution({
                marketplaceDistributionAmounts: marketplaceDistributionAmounts,
                marketplaceDistributionAddresses: marketplaceDistributionAddresses
            });
            marketplaceDistributions[nextNFTID+j] = marketplaceDistribution;
        }

        emit PackCreated(nextPackId, serie, packType, drop);
        nextNFTID = nextNFTID + nftAmount;
        nextPackId = nextPackId + 1;
    }

    function offerPack(uint256 packId, address receivingAddress) public override onlyOwner {
        require(packs[packId].packId == packId, "Pack does not exist");
        Pack storage pack = packs[packId];
        //packs[packId].buyer = receivingAddress;
        pack.buyer = receivingAddress;

        openedPacks += 1;

        for(uint i = 0; i < pack.nftAmount; i++){
            registeredIDs[receivingAddress][pack.initialNFTId+i] = true;
            registeredIDsArray[receivingAddress].push(i);
        }
        emit PackBought(receivingAddress, packId);
    }

    function editPackInfo(
        uint256 packId, uint256 saleStart, string memory serie
        , string memory packType, string memory drop, uint256 price
    ) public override onlyOwner {
        require(block.timestamp < packs[packId].saleStart, "Sale is already live");
        Pack storage pack = packs[packId];
        pack.saleStart = saleStart;
        pack.serie = serie;
        pack.packType = packType;
        pack.drop = drop;
        pack.price = price;
    }

    function deletePackById(uint256 packId) public override onlyOwner {
        require(block.timestamp < packs[packId].saleStart, "Sale is already live");
        delete packs[packId];
        emit PackDelete(packId);
    }

    function mint(uint256 tokenIdToMint) public override {
        require(registeredIDs[msg.sender][tokenIdToMint], "Token was not registered or not the rightful owner");
        require(!alreadyMinted[tokenIdToMint], "Already minted");

        alreadyMinted[tokenIdToMint] = true;
        _safeMint(msg.sender, tokenIdToMint);
        emit NftMinted(tokenIdToMint);
    }

    function setPurchaseTokenAddress(IERC20 _purchaseToken) public override onlyOwner {
        purchaseToken = ERC20(address(_purchaseToken));
    }

    function setTokenPriceInUSD(uint256 newPrice /* 1*10e18 -> 1 FVR = $1; 1*10e17 -> 0.1 FVR = $1  */)
        public override onlyOwner
    {
        require(newPrice != 0, "newPrice has to higher than 0");
        realFvrTokenPriceUSD = newPrice;
    }

    function lock() external override onlyOwner {
        closed = true;
    }

    function unlock() external override onlyOwner {
        closed = false;
    }

    /// NOTE: At the request of the client
    function setNextPackId(uint256 newNextPackId) external onlyOwner {
        require(nextPackId != newNextPackId, 'New value for next pack id required');
        nextPackId = newNextPackId;
    }

    /// NOTE: At the request of the client
    function setNextNFTID(uint256 newNextNFTID) external onlyOwner {
        require(nextNFTID != newNextNFTID, 'New value for next NFT id required');
        nextNFTID = newNextNFTID;
    }
}
