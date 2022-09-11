pragma solidity ^0.6.6;
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

contract SwapTokens {
  address private UNISWAP_V2_ROUTER;
  address private WETH;
  address private owner;

  event Swap(address tokenIn, address tokenOut, uint amountIn, uint amountOut, address to, uint timestamp);

  constructor() {
    UNISWAP_V2_ROUTER = 0x19326b7F6d45e40fDb04C2Cd7c47147c6FA18D92; // Address in Ganache
    WETH = 0xf25812889146372f9614c499228620EB7017A569;              // Address in Ganache
    owner = msg.sender; 
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only the owner can call this function");
    _;
  }

  function updateUniswapV2RouterAddress(address _newAddress) public onlyOwner() {
    UNISWAP_V2_ROUTER = _newAddress;
  }

  function updateWETHAddress(address _newAddress) public onlyOwner() {
    WETH = _newAddress;
  }

  /**
   * @dev Swaps two tokens specifying the minimum number of tokens to receive in exchange for the tokens you give
   * @param _tokenIn - The address of the token the trader is sending
   * @param _tokenOut - The address of the token the trader wants to receive
   * @param _amountIn - The amount of tokens given by the trader
   * @param _amountOutMin - The amount of desired tokens to receive out of the trade
   * @param _to - The address that will receive the output tokens
   * Returns the total of output tokens to the specified address in the _to parameter
   */
   function swap(
    address _tokenIn,
    address _tokenOut,
    uint _amountIn,
    uint _amountOutMin,
    address _to
   ) external {
    IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
    IERC20(_tokenIn).approve(UNISWAP_V2_ROUTER, _amountIn);
    
    // Trades the _tokenIn for WETH and then WETH for the _tokenOut
    address[] memory path;
    path = new address[](3);
    path[0] = _tokenIn;
    path[1] = WETH;
    path[2] = _tokenOut;

    IUniswapRouter(UNISWAP_V2_ROUTER).swapExactTokensForTokens(_amountIn, _amountOutMin, path, _to, block.timestamp);
    emit Swap(_tokenIn, _tokenOut, _amountIn, _amountOutMin, _to, block.timestamp);
   }



}