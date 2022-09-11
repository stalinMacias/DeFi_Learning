pragma solidity ^0.6.6;
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';

contract UniswapUtilities {
  function getReserves(address tokenPair) external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) {
    (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) = IUniswapV2Pair(tokenPair).getReserves();
    return (reserve0,reserve1,blockTimestampLast);
  }
}


