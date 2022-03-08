// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";



interface IOpenerRealFvr is IERC721 {

    event PackCreated(uint256 packId, string indexed serie, string indexed packType, string indexed drop);
    event PackBought(address indexed by, uint256 indexed packId);
    event PackOpened(address indexed by, uint256 indexed packId);
    event PackDelete(uint256 indexed packId);
    event NftMinted(uint256 indexed nftId);

    function getRegisteredIDs(address _address) external view returns(uint256[] memory);

    function getPackbyId(uint256 packId) external returns (
        uint256,  uint256, uint256, string memory, string memory, string memory, address, 
        address[] memory, uint256[] memory, bool
    );

    function getMarketplaceDistributionForERC721(uint256 tokenId) external returns(
        uint256[] memory, address[] memory
    );
    
    function getPackPriceInFVR(uint256 packId) external returns (uint256);

    function buyPack(uint256 packId) external;

    function buyPacks(uint256[] memory packIds) external;

    function openPack(uint256 packId) external;

    function openPacks(uint256[] memory packIds) external;

    function createPack(uint256 nftAmount, uint256 price /* 1 = ($1) */, 
        string memory serie, string memory packType, string memory drop, uint256 saleStart,
        address[] memory saleDistributionAddresses,  uint256[] memory saleDistributionAmounts, /* [1;98;1]*/
        address[] memory marketplaceDistributionAddresses,  uint256[] memory marketplaceDistributionAmounts /* [1;98;1]*/
    ) external;

    function offerPack(uint256 packId, address receivingAddress) external;

    function editPackInfo(
        uint256 packId, uint256 saleStart, string memory serie
        , string memory packType, string memory drop, uint256 price
    ) external;

    function deletePackById(uint256 packId) external;

    function mint(uint256 tokenIdToMint) external;

    //function setPurchaseTokenAddress(ERC20 _purchaseToken) external;
    function setPurchaseTokenAddress(IERC20 _purchaseToken) external;

    function setTokenPriceInUSD(uint256 newPrice /* 1*10e18 -> 1 FVR = $1; 1*10e17 -> 0.1 FVR = $1  */) external;

    function lock() external;

    function unlock() external;
}
