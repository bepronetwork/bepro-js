pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../ERC721Marketplace.sol";

contract MarketplaceRealFvr is ERC721Marketplace {
    
    constructor(ERC20 _erc20Address, 
        ERC721 _erc721Address) 
    public ERC721Marketplace(_erc20Address, _erc721Address) {
     
    }

}