pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../ERC721Marketplace.sol";


interface OpenerRealFvr is IERC721 {
    function getMarketplaceDistributionForERC721(uint256 tokenId) external returns(uint256[] memory, address[] memory);
}

contract MarketplaceRealFvr is ERC721Marketplace {
    
    OpenerRealFvr public erc721Address;

    constructor(ERC20 _erc20Address, 
        OpenerRealFvr _erc721Address) 
    public ERC721Marketplace(_erc20Address, _erc721Address) {
        erc721Address = _erc721Address;
    }

    function buyERC721(uint256 _tokenId) payable public virtual override {
        require(sales[_tokenId].tokenId == _tokenId, "NFT is not in sale");
        require(!sales[_tokenId].sold, "NFT has to be available for purchase" );

        //Get Marketplace Sale Distibutions on the Smart Contract
        uint256[] memory distributionAmounts;
        address[] memory distributionAddresses;

        (distributionAmounts, distributionAddresses) = erc721Address.getMarketplaceDistributionForERC721(_tokenId);

        if(isNativeTransaction()){
            //Transfer Native ETH to contract
            require(sales[_tokenId].price == msg.value, "Require Amount of Native Currency to be correct");   
            
            uint256 totalFee = 0;
            for(uint i = 0; i < distributionAmounts.length; i++){
                if(distributionAddresses[i] != address(0)){
                    // Transfer fee to fee address
                    require(payable(distributionAddresses[i]).send(
                            (distributionAmounts[i] * sales[_tokenId].price) / 100
                    ), "Contract was not allowed to do the transfer");
                    totalFee = totalFee + distributionAmounts[i];
                }
            }

            if(feeAddress != address(0)){
                // Transfer fee to fee address
                require(feeAddress.send(
                        (feePercentage * sales[_tokenId].price) / 100
                ), "Contract was not allowed to do the transfer");
            }
        
            //Transfer Native Currency to seller
            require(sales[_tokenId].seller.send(((100-feePercentage-totalFee) * sales[_tokenId].price) / 100), "Wasnt able to transfer the Native Currency to the seller");
        
        }else{
            //Transfer ERC20 to contract
            require(erc20Address.transferFrom(msg.sender, address(this), sales[_tokenId].price), "Contract was not allowed to do the transfer");

            uint256 totalFee = 0;
            for(uint i = 0; i < distributionAmounts.length; i++){
                if(distributionAddresses[i] != address(0)){
                    // Transfer fee to fee address
                    require(erc20Address.transfer(
                            distributionAddresses[i],
                            (distributionAmounts[i] * sales[_tokenId].price) / 100
                    ), "Contract was not allowed to do the transfer");
                    totalFee = totalFee + distributionAmounts[i];
                }
            }

            if(feeAddress != address(0)){
                // Transfer fee to fee address
                require(erc20Address.transfer(
                        feeAddress,
                        (feePercentage * sales[_tokenId].price) / 100
                ), "Contract was not allowed to do the transfer");
            }
        
            //Transfer ERC20 to seller
            require(erc20Address.transfer(sales[_tokenId].seller, ((100-feePercentage-totalFee) * sales[_tokenId].price) / 100), "Wasnt able to transfer the ERC20 to the seller");
        }
        
        //Transfer ERC721 to buyer
        erc721Address.transferFrom(address(this), msg.sender, _tokenId);

        sales[_tokenId].sold = true;
        emit SaleDone(_tokenId, msg.sender, sales[_tokenId].seller, sales[_tokenId].price);
    }

}