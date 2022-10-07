// SPX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

// CSAMM stands for Constant Sum Auto Market Maker
// CSAMM are not really used in DeFi real products, but CSAMM are useful for education purposes
// A CSAMM can be think of as a Uniswap Liquidity Pool for a Pair of ERC20 Tokens

contract CSAMM {

  IERC20 public immutable token0;
  IERC20 public immutable token1;

  uint public reserve0; // amount of tokens0 locked on this in contract
  uint public reserve1; // amount of tokens1 locked on this in contract

  uint public totalSupply;  // totalShares minted
  mapping(address => uint) public balanceOf;  // shares owned by each provider

  event WithdrawLiquidity(uint returnTokens0, uint returnTokens1);

  constructor(address _token0, address _token1) {
    token0 = IERC20(_token0);
    token1 = IERC20(_token1);
  }

  function getSharesPerProvider(address _provider) public view returns(uint) {
    return balanceOf[_provider];
  }

  function _mint(address _to, uint _amount) private {
    balanceOf[_to] += _amount;
    totalSupply += _amount;
  }

  function _burn(address _from, uint _amount) private {
    balanceOf[_from] -= _amount;
    totalSupply -= _amount;
  }

  function _update(uint _newReserve0, uint _newReserver1) internal {
    reserve0 = _newReserve0;
    reserve1 = _newReserver1;
  }

  function swap(address _tokenIn, uint _amountIn) external returns (uint amountOut) {
    require(_tokenIn == address(token0) || _tokenIn == address(token1) , "_tokenIn is not a valid token for this CSAMM");
 
    // transfer token in
    bool isToken0 = (_tokenIn == address(token0));
    
    (IERC20 tokenIn, IERC20 tokenOut, uint reserveIn, uint reserveOut) = isToken0 
      ? (token0, token1, reserve0, reserve1) 
      : (token1, token0, reserve1, reserve0);

    require(tokenIn.allowance(msg.sender,address(this)) >= _amountIn, "Not enough tokens have been approved");

    tokenIn.transferFrom(msg.sender, address(this), _amountIn);

    uint amountIn = tokenIn.balanceOf(address(this)) - reserveIn;

    // calculate amount of tokens out (including fees)
    // 3% fee = 0.3%
    amountOut = (amountIn / 997) * 1000;

    // update reserve0 and reserve1 state variables
    (uint res0, uint res1) = (isToken0)
      ? (reserveIn + _amountIn, reserveOut - amountOut)
      : (reserveOut - amountOut, reserveIn + _amountIn );

    // Update the internal reserves of the two tokens in this contract
    _update(res0, res1);

    // transfer token out
    tokenOut.transfer(msg.sender, amountOut);
  }

  /**
   * @dev addLiquidity() function does not validate if the tokens addresses are correct because it inherits all the validations from the ERC20 token itself
   * When the transferFrom() function is called, all the validation made at the ERC20 contract's side will determine if the transfer is executed or if it fails.
   * If the transfer fails at any point, all the previous steps of the transaction will be reverted because the transactions behaves as a singular executable component.
   */
  function addLiquidity(uint _amount0, uint _amount1) external returns (uint shares) {
    token0.transferFrom(msg.sender, address(this), _amount0);
    token1.transferFrom(msg.sender, address(this), _amount1);

    uint currentReserve0 = token0.balanceOf(address(this));
    uint currentReserve1 = token1.balanceOf(address(this));

    uint newLiquidityToken0 = currentReserve0 - reserve0;
    uint newLiquidityToken1 = currentReserve1 - reserve1;

    /*
    a = amount in
    L = total liquidity
    s = shares to mint
    T = total supply

    s should be proportional to increase from L to L + a
    (L + a) / L = (T + s) / T

    s = a * T / L
    */
    if (totalSupply == 0) {
      shares = newLiquidityToken0 + newLiquidityToken1;
    } else {
      shares = ((newLiquidityToken0 + newLiquidityToken1) * totalSupply) / (reserve0 + reserve1);
    }

    require(shares > 0, "No new shares were minted");
    _mint(msg.sender, shares);

    _update(currentReserve0, currentReserve1);
  }

  function removeLiquidity(uint _shares) external returns (uint returnedTokens0, uint returnedTokens1) {
    // calculate the amount of tokens 0 & 1 to return
    /*
    a = amount out
    L = total liquidity
    s = shares
    T = total supply

    a / L = s / T

    a = L * s / T
      = (reserve0 + reserve1) * s / T
    */
    require(_shares > 0, "Error, no shares were sent to remove liquidity");
    returnedTokens0 = (reserve0  * _shares) / totalSupply;
    returnedTokens1 = (reserve1  * _shares) / totalSupply;

    // burn the shares
    _burn(msg.sender, _shares);

    // update reserve0 and reserve1 state variables
    _update(reserve0 - returnedTokens0, reserve1 - returnedTokens1);
    
    // transfer the tokens out to the provider's address
    if (returnedTokens0 > 0) {
      token0.transfer(msg.sender, returnedTokens0);
    }

    if (returnedTokens1 > 0) {
      token1.transfer(msg.sender, returnedTokens1);
    }

    emit WithdrawLiquidity(returnedTokens0,returnedTokens1);

  }

}