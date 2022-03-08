// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./utils/Ownable.sol";

contract ERC721Marketplace is Ownable {
    using SafeMath for uint256;

    ERC20 public erc20Address;
    IERC721 private erc721Address;
    address payable public feeAddress;
    uint256 public feePercentage = 0; // 1 = 1%
    uint256 public saleIncrementId = 1;
    
    mapping(uint256 => Sale) public sales; // maps token id with sales object
    mapping(uint256 => uint256) public salesById; // maps saleId with token id

    struct Sale {
        uint256 saleId;
        uint256 tokenId;
        uint256 timesSold;
        uint256 price;
        address payable seller;
        address buyer;
        uint256 date;
        bool canceled;
        bool sold;
    }

    constructor(IERC20 _erc20Address, IERC721 _erc721Address) public {
        erc20Address = ERC20(address(_erc20Address));
        erc721Address = _erc721Address;
    }

    event SaleCreated(uint256 indexed tokenId, uint256 price, address indexed creator);
    event SaleCanceled(uint256 indexed tokenId, address indexed creator);
    event SaleDone(uint256 indexed tokenId, address indexed buyer,  address indexed creator, uint256 price);


    modifier onlyNFTOwner(uint256 _tokenId) {
        _onlyNFTOwner(_tokenId);
        _;
    }

    modifier onlyNFTSaleOwner(uint256 _tokenId) {
        _onlyNFTSaleOwner(_tokenId);
        _;
    }

    modifier onlyNFTOnSale(uint256 _tokenId) {
        _onlyNFTOnSale(_tokenId);
        _;
    }

    function _onlyNFTOwner(uint256 _tokenId) internal view {
        require(erc721Address.ownerOf(_tokenId) == msg.sender, "NFT owner required");
    }

    function _onlyNFTSaleOwner(uint256 _tokenId) internal view {
        require(sales[_tokenId].seller == msg.sender, "NFT sale owner required");
    }

    function _onlyNFTOnSale(uint256 _tokenId) internal view {
        require(sales[_tokenId].tokenId == _tokenId, "NFT is not in sale");
    }
    
    function isNativeTransaction() public returns (bool) {
        return (address(erc20Address) == address(0));
    }

    

    function putERC721OnSale(uint256 _tokenId, uint256 _price) public
        onlyNFTOwner(_tokenId)
    {
        //require(erc721Address.ownerOf(_tokenId) == msg.sender, "Not Owner of the NFT");
        erc721Address.transferFrom(msg.sender, address(this), _tokenId);
        // Create Sale Object
        Sale memory sale = sales[_tokenId];
        sale.saleId = saleIncrementId;
        sale.tokenId = _tokenId;
        sale.price = _price;
        sale.seller = msg.sender;
        sale.date = block.timestamp;
        sales[_tokenId] = sale;
        salesById[saleIncrementId] = _tokenId;

        emit SaleCreated(_tokenId, _price, msg.sender);
        saleIncrementId = saleIncrementId+1;
    }


    function removeERC721FromSale(uint256 _tokenId) public
        onlyNFTSaleOwner(_tokenId)
        onlyNFTOnSale(_tokenId)
    {
        //require(sales[_tokenId].seller == msg.sender, "Not Owner of the NFT");
        //require(sales[_tokenId].tokenId == _tokenId, "NFT is not in sale");
        sales[_tokenId].canceled = true;
        delete sales[_tokenId];
        erc721Address.transferFrom(address(this), msg.sender, _tokenId);
        emit SaleCanceled(_tokenId, msg.sender);
    }

    function buyERC721(uint256 _tokenId) payable public virtual
        onlyNFTOnSale(_tokenId)
    {
        //require(sales[_tokenId].tokenId == _tokenId, "NFT is not in sale");
        require(!sales[_tokenId].sold, "NFT has to be available for purchase" );
        
        if(isNativeTransaction()){
            //Transfer Native ETH to contract
            require(sales[_tokenId].price == msg.value, "Require Amount of Native Currency to be correct");

            if(feeAddress != address(0)){
                // Transfer fee to fee address
                require(feeAddress.send(
                        (feePercentage * sales[_tokenId].price) / 100
                ), "Contract was not allowed to do the transfer");
            }
        
            //Transfer ERC20 to seller
            require(sales[_tokenId].seller.send(((100-feePercentage) * sales[_tokenId].price) / 100), "Wasnt able to transfer the Native Currency to the seller");
        }else{
            //Transfer ERC20 to contract
            require(erc20Address.transferFrom(msg.sender, address(this), sales[_tokenId].price), "Contract was not allowed to do the transfer");

            if(feeAddress != address(0)){
                // Transfer fee to fee address
                require(erc20Address.transfer(
                        feeAddress,
                        (feePercentage * sales[_tokenId].price) / 100
                ), "Contract was not allowed to do the transfer");
            }
        
            //Transfer ERC20 to seller
            require(erc20Address.transfer(sales[_tokenId].seller, ((100-feePercentage) * sales[_tokenId].price) / 100), "Wasnt able to transfer the ERC20 to the seller");
        }

        //Transfer ERC721 to buyer
        erc721Address.transferFrom(address(this), msg.sender, _tokenId);

        sales[_tokenId].sold = true;
        emit SaleDone(_tokenId, msg.sender, sales[_tokenId].seller, sales[_tokenId].price);
        delete sales[_tokenId];
    }

    function changeERC20(ERC20 _erc20Address) public onlyOwner {
        erc20Address = _erc20Address;
    }

    function changeERC721(IERC721 _erc721Address) public onlyOwner {
        erc721Address = _erc721Address;
    }

    function setFixedFees(address payable _feeAddress, uint256 _feePercentage) public onlyOwner {
        require(_feeAddress != address(0), "Address cant be null");
        require(_feePercentage < 100, "Fee Percentage has to be lower than 100");
        feeAddress = _feeAddress;
        feePercentage = _feePercentage;
    }

}