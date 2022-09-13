// Contract to represent the WETH ERC20
/**
 * @dev The contract receives Ethers and returns an equivalent amount of WETH tokens
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETH is ERC20 {

  event Deposit(address indexed account, uint ammount);
  event Withdraw(address indexed account, uint ammount);
  
  constructor() ERC20("Wrapped Ethereum", "WETH") { }

  /**
   * @dev This contract can receive Ethers directly, and whenever someone sends Ethers to the contract it'll receive in exchange an exact amount of WETH
   * When no other function matches (not even the receive function)
   */
  fallback() external payable {
    deposit();
  }

  /**
   * for empty calldata (and any value)
  */
  receive() external payable {
    deposit();
  }

  /**
   * @dev deposit() function is invoked when an user wants to exchange its ETHs for WETHs, the function calls the _mint() function from the ERC20 contract and passes the msg.sender and msg.value as parameters
   */
  function deposit() public payable {
    _mint(msg.sender,msg.value);
    emit Deposit(msg.sender,msg.value);
  }

  /**
   * @dev withdraw() function is invoked when an user wants to exchange WETH tokens for ETH
   * The function calls the _burn() method from the ERC20 contract to burn the desired amount of WETH to be converted to ETH - Of this way the circulating WETH is accurate with the total existing locked ETH in the contract
   * This functions is secured agains re-entrancy attacks
   */
  function withdraw(uint _amount) external {
    _burn(msg.sender,_amount);
    (bool sent, ) = payable(msg.sender).call{value: _amount}("");
    require(sent, "Failed to exchange the requested WETH amount of tokens for Ether");
  }




}

