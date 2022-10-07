// SPX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

// contract to emulate a Constant Product Auto Market Maker (CPAMM)
contract CPAMM {
  IERC20 public immutable token0;
  IERC20 public immutable token1;

  uint public reserve0;
  uint public reserve1;

  uint public totalSupply;            // Keeps track of the total active shares
  mapping(address => uint) balanceOf; // Keeps track of the shares per Provider

  event WithdrawLiquidity(uint returnTokens0, uint returnTokens1);

  constructor(address _token0, address _token1) {
    token0 = IERC20(_token0);
    token1 = IERC20(_token1);
  }

  function _mint(address _to, uint _amount) internal {
    balanceOf[_to] += _amount;
    totalSupply += _amount;
  }

  function _burn(address _from, uint _amount) internal {
    balanceOf[_from] -= _amount;
    totalSupply -= _amount;
  }

  function _update(uint _newReserve0, uint _newReserve1) internal {
    reserve0 = _newReserve0;
    reserve1 = _newReserve1;
  }

  function getSharesPerProvider(address _provider) public view returns(uint) {
    return balanceOf[_provider];
  }

  /**
   * @dev -> swap() function receives one of the two tokens that the AMM is composed of and depending on the number of tokens that are sent, calculates the number of the other token to give in exchange
   * @param _tokenIn -> The address of the token that the swapper will send to the AMM
   * @param _amountIn -> The number of tokens the swapper is sending to the AMM
   * @return amountOut -> The number of tokens that the AMM will give to the provider in exchange for the token they send
   */
  function swap(address _tokenIn, uint _amountIn) external returns (uint amountOut) {
    require(_tokenIn == address(token0) || _tokenIn == address(token1), "The _tokenIn is not compatible with this CPAMM - Invalid Token");
    require(_amountIn > 0, "Invalid value for _amountIn, must be greather than 0");
    // Determine if _tokenIn is token0 or token1 - same for reserves
    bool isToken0 = _tokenIn == address(token0);
    (IERC20 tokenIn, IERC20 tokenOut, uint reserveIn, uint reserveOut) = (isToken0)
      ? (token0, token1, reserve0, reserve1) 
      : (token1, token0, reserve1, reserve0);
    
    // Pull into this contract the number of tokensIn the swapper wants to swap
    // Note: The number of tokens the swapper is swapping must be already approved before calling this function!
    tokenIn.transferFrom(msg.sender,address(this),_amountIn);

    // Calculate number of tokensOut (include fees); fee is 0.3%
    /*
      How much dy for dx?

      xy = k
      (x + dx)(y - dy) = k
      y - dy = k / (x + dx)
      y - k / (x + dx) = dy
      y - xy / (x + dx) = dy
      (yx + ydx - xy) / (x + dx) = dy

      ydx / (x + dx) = dy                     <---> Formula to calculate the number of tokens out
        y --> reserveOut ||| x --> reserveIn 
        dy --> amountOut ||| dx --> amountIn
    */
    uint amoutIntWithFees = (_amountIn * 997) / 1000;
    amountOut = (reserveOut * amoutIntWithFees) / (reserveIn + amoutIntWithFees);

    // Transfer tokensOut to the swapper
    tokenOut.transfer(msg.sender,amountOut);

    // Update the reserves - reserves can be updated after transfering the tokensOut because at this point the token's contracts reflects the most up to date balance
    _update(
      token0.balanceOf(address(this)), 
      token1.balanceOf(address(this))
    );
  }

  /**
    @dev -> addLiquidity() function - A provider can add liquidity to the CPAMM and earn some fees from the trades
    @return shares --> The function calculates a proportional number of shares based on the added liquidity and sends it to the provider, so the provider later can recover the corresponding number of tokens based on their shares and the total shares
   */
  function addLiquidity(uint _amount0, uint _amount1) external returns (uint shares) {
    // transfer amount0 and amount1 of both tokens into the contract
    token0.transferFrom(msg.sender, address(this), _amount0);
    token1.transferFrom(msg.sender, address(this), _amount1);

    // Validate the price won't change if the given tokens are added as liquidity
    /*
      How much dx, dy to add?

      xy = k
      (x + dx)(y + dy) = k'

      No price change, before and after adding liquidity
      x / y = (x + dx) / (y + dy)

        dy --> amount1 ||| dx --> amount0
        y --> reserve1 ||| x --> reserve0

      x(y + dy) = y(x + dx)
      x * dy = y * dx

      x / y = dx / dy
      dy = y / x * dx

    */
    if (reserve0 > 0 || reserve1 > 0) {
      require(reserve0 * _amount1 == reserve1 * _amount0, "dy / dx != y / x ==> The price could change");
    }

    // Mint the proportional number of shares
    /*
      How much shares to mint?

      f(x, y) = value of liquidity
      We will define f(x, y) = sqrt(xy)

      L0 = f(x, y)
      L1 = f(x + dx, y + dy)
      T = total shares
      s = shares to mint

      Total shares should increase proportional to increase in liquidity
      L1 / L0 = (T + s) / T

      L1 * T = L0 * (T + s)

      (L1 - L0) * T / L0 = s 
    */

     /*
      Claim
      (L1 - L0) / L0 = dx / x = dy / y

      Proof
      --- Equation 1 ---
      (L1 - L0) / L0 = (sqrt((x + dx)(y + dy)) - sqrt(xy)) / sqrt(xy)
      
      dx / dy = x / y so replace dy = dx * y / x

      --- Equation 2 ---
      Equation 1 = (sqrt(xy + 2ydx + dx^2 * y / x) - sqrt(xy)) / sqrt(xy)

      Multiply by sqrt(x) / sqrt(x)
      Equation 2 = (sqrt(x^2y + 2xydx + dx^2 * y) - sqrt(x^2y)) / sqrt(x^2y)
                  = (sqrt(y)(sqrt(x^2 + 2xdx + dx^2) - sqrt(x^2)) / (sqrt(y)sqrt(x^2))
      
      sqrt(y) on top and bottom cancels out

      --- Equation 3 ---
      Equation 2 = (sqrt(x^2 + 2xdx + dx^2) - sqrt(x^2)) / (sqrt(x^2)
      = (sqrt((x + dx)^2) - sqrt(x^2)) / sqrt(x^2)  
      = ((x + dx) - x) / x
      = dx / x

      Since dx / dy = x / y,
      dx / x = dy / y

      Finally
      (L1 - L0) / L0 = dx / x = dy / y

      s = ((dx / x) * T) = ((dy / y) * T)       <---> Formula to calculate the number of shares to mint!
        T --> totalShares
    */
    if (totalSupply == 0) {
      shares = _sqrt(_amount0 * _amount1);
    } else {
      shares = _min(
       (_amount0 * totalSupply) / reserve0 , 
       (_amount1 * totalSupply) / reserve1);
    }

    require(shares > 0 , "No new shares were created");
    _mint(msg.sender, shares);
    
    // Update the reserves - At this point, the CPAMM contract already have the tokens in its balance
    _update(
      token0.balanceOf(address(this)), 
      token1.balanceOf(address(this))
    );
  }


  /**
    @dev -> removeLiquidity() function allows the Providers to remove their liquidity by burning their shares and receiving in exchange an equivalent amount of tokens
   */
  function removeLiquidity(uint _shares) external returns (uint returnedTokens0, uint returnedTokens1) {
    // calculate the amount of tokens 0 & 1 to return
    /*
      Claim
      dx, dy = amount of liquidity to remove
      dx = s / T * x
      dy = s / T * y

      Proof
      Let's find dx, dy such that
      v / L = s / T
      
      where
      v = f(dx, dy) = sqrt(dxdy)
      L = total liquidity = sqrt(xy)
      s = shares
      T = total supply

      --- Equation 1 ---
      v = s / T * L
      sqrt(dxdy) = s / T * sqrt(xy)

      Amount of liquidity to remove must not change price so 
      dx / dy = x / y

      replace dy = dx * y / x
      sqrt(dxdy) = sqrt(dx * dx * y / x) = dx * sqrt(y / x)

      Divide both sides of Equation 1 with sqrt(y / x)
      dx = s / T * sqrt(xy) / sqrt(y / x)
          = s / T * sqrt(x^2) = s / T * x
      
      dx = s / T * x                        <----> formula to calculate the number of X tokens to give in return for the burned shares

      Likewise
      dy = s / T * y                        <----> formula to calculate the number of Y tokens to give in return for the burned shares
    */

    // currentReserve0 >= reserve0
    // currentReserve1 >= reserve1
    uint currentReserve0 = token0.balanceOf(address(this));
    uint currentReserve1 = token1.balanceOf(address(this));

    returnedTokens0 = (_shares * currentReserve0) / totalSupply;
    returnedTokens1 = (_shares * currentReserve1) / totalSupply;

    require(returnedTokens0 > 0 && returnedTokens1 > 0 , "Any of the two returned tokens is not greather than 0");

    // burn the shares
    _burn(msg.sender, _shares);

    // update reserve0 and reserve1 state variables
    _update(
      currentReserve0 - returnedTokens0, 
      currentReserve1 - returnedTokens1
    );

    // transfer the tokens out to the provider's address
    token0.transfer(msg.sender, returnedTokens0);
    token1.transfer(msg.sender, returnedTokens1);

    emit WithdrawLiquidity(returnedTokens0,returnedTokens1);
    
  }


  function _sqrt(uint y) private pure returns (uint z) {
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
  }

  function _min(uint x, uint y) private pure returns (uint) {
    return x <= y ? x : y;
  }


}