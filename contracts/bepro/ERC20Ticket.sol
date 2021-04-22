pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../utils/Ownable.sol";

/**
 * @dev Mintable token with a token cap.
 */
contract BEPROTicket is ERC20, Ownable{

    uint256 public intialTickets = 200000*10**18;
    uint256 public totalSupplyMax = 1000000*10**18; // 1 Million Tickets
    string private override _name = "BEPRO Gas";
    string private override _symbol = "BEPRO-Gas";

    constructor() public ERC20(_name, _symbol) {
        _mint(0x6714d41094a264BB4b8fCB74713B42cFEe6B4F74, intialTickets);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        // Filled 
        if(totalSupplyMax >= totalSupply().add(amount)){
            _mint(account, amount);
        }else{
            // Verify if totally filled
            uint256 diff = totalSupplyMax.sub(totalSupply());
            if(diff != 0){
                _mint(account, diff);
            }
        }
    }

    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }
}