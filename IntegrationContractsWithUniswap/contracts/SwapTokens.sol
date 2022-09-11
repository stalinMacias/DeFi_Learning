pragma solidity ^0.6.6;
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

contract SwapTokens {
  address private UNISWAP_V2_ROUTER;
  address private WETH;
  address private owner;

  event Swap(address tokenIn, address tokenOut, uint amountIn, uint amountOut, address to, uint timestamp);

  constructor() {
    UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    owner = msg.sender;
  }
}