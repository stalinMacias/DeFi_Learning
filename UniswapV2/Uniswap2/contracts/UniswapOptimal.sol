// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "./interfaces/SafeMath.sol";
import "./interfaces/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

/**
 * @dev These functions only requires how many tokens from one of the two tokens in a pool will be added as liquidity
 * internally, the functions calculates how many tokens of the other token will be required to perform a swap using all the tokens that the user wants to add as liquidity
 * Once the functions have estimated the required tokens, a swap is performed to get the exact amount of the token B so all the tokens A can be added as liquidity
 * After the swap is perfomed, the token A & token B are sent as liquidity to the pool
 * And, voahala, no tokens are left, all the token A was added as liquidity and the reserve ratio in the pool is remain
*/
contract UniswapOptimal {
  using SafeMath for uint;

  address private constant UNISWAP_FACTORY = 0xC608F0718beA3563605aa652589767Cb35fcD05D; //Ganache
  address private constant UNISWAP_ROUTER = 0x19326b7F6d45e40fDb04C2Cd7c47147c6FA18D92;  //Ganache
  address private constant WETH = 0xf25812889146372f9614c499228620EB7017A569;            //Ganache

  // import "@uniswap/lib/contracts/libraries/Babylonian.sol";
  function sqrt(uint y) internal pure returns (uint z) {
    if (y > 3) {
      z = y;
      uint x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
    // else z = 0 (default value)
  }

  /*
  s = optimal swap amount
  r = amount of reserve for token a - reserve pool for token a
  a = amount of token a the user currently has (not added to reserve yet)
  f = swap fee percent
  s = (sqrt(((2 - f)r)^2 + 4(1 - f)ar) - (2 - f)r) / (2(1 - f))
  */
  function getSwapAmount(uint r, uint a) public pure returns (uint) {
    return (sqrt(r.mul(r.mul(3988009) + a.mul(3988000))).sub(r.mul(1997))) / 1994;
  }

  /* optimal one-sided supply
  1. swap optimal amount from token A to token B
  2. add liquidity
  */
  function zap(
    address _tokenA,
    address _tokenB,
    uint _amountA
  ) external {
    require(_tokenA == WETH || _tokenB == WETH, "!weth");

    IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);

    address pair = IUniswapV2Factory(UNISWAP_FACTORY).getPair(_tokenA, _tokenB);
    (uint reserve0, uint reserve1, ) = IUniswapV2Pair(pair).getReserves();

    uint swapAmount;
    if (IUniswapV2Pair(pair).token0() == _tokenA) {
      // swap from token0 to token1
      swapAmount = getSwapAmount(reserve0, _amountA);
    } else {
      // swap from token1 to token0
      swapAmount = getSwapAmount(reserve1, _amountA);
    }
    // Swaps tokensA for the optimal amount of tokensB so all the tokensA (what is left) can be added as liquidity
    _swap(_tokenA, _tokenB, swapAmount);
    // Add as liquidity what is left from tokenA after swapping the optimal amount of tokensB to add all the tokenA liquidity
    _addLiquidity(_tokenA, _tokenB);
  }

  /* sub-optimal one-sided supply
  1. swap half of token A to token B
  2. add liquidity
  */
  function subOptimalZap(
    address _tokenA,
    address _tokenB,
    uint _amountA
  ) external {
    IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);

    _swap(_tokenA, _tokenB, _amountA.div(2));
    _addLiquidity(_tokenA, _tokenB);
  }

  /**
   * @dev The OUTPUT_TOKENS are sent to this contract, which allows to add the liquidity right after the swap is completed
   * @dev The tokensA that'll be used to make the swap comes from the original amount that was sent to the zap() function
   * @dev -  Returns the optimal amount of tokensB that'll be used to add what is left of tokensA as liquidity
  */
  function _swap(
    address _from,
    address _to,
    uint _amount
  ) internal {
    IERC20(_from).approve(UNISWAP_ROUTER, _amount);

    address[] memory path = new address[](2);
    path = new address[](2);
    path[0] = _from;
    path[1] = _to;

    IUniswapV2Router02(UNISWAP_ROUTER).swapExactTokensForTokens(
      _amount,
      1,
      path,
      address(this),
      block.timestamp
    );
  }

  /**
   * @dev The tokensA that'll be added as liquidity is what is left after swapping the optimal amount of tokensB
   * @dev The tokensB were obtained from swapping some tokensA
  */
  function _addLiquidity(address _tokenA, address _tokenB) internal {
    uint balA = IERC20(_tokenA).balanceOf(address(this));
    uint balB = IERC20(_tokenB).balanceOf(address(this));
    IERC20(_tokenA).approve(UNISWAP_ROUTER, balA);
    IERC20(_tokenB).approve(UNISWAP_ROUTER, balB);

    IUniswapV2Router02(UNISWAP_ROUTER).addLiquidity(
      _tokenA,
      _tokenB,
      balA,
      balB,
      0,
      0,
      address(this),
      block.timestamp
    );
  }

  function getPair(address _tokenA, address _tokenB) external view returns (address) {
    return IUniswapV2Factory(UNISWAP_FACTORY).getPair(_tokenA, _tokenB);
  }
   

}