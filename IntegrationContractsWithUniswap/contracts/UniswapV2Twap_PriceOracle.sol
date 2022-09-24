//SPDX-License-Identifier: MIT
pragma solidity 0.6.6;
// NOTE: using solidity 0.6.6 to match imports

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/lib/contracts/libraries/FixedPoint.sol";
import "@uniswap/v2-periphery/contracts/libraries/UniswapV2OracleLibrary.sol";
import "@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol";

contract UniswapV2Twap_PriceOracle {
  using FixedPoint for *;

  uint public constant PERIOD = 10; // 10 seconds for the tests! For an oracle deployed in mainnet this value might be a larger period of time, each hour, 2,3,6,12 hours, once a day....

  IUniswapV2Pair public immutable pair;
  address public immutable token0;
  address public immutable token1;

  uint public price0CumulativeLast;
  uint public price1CumulativeLast;
  uint32 public blockTimestampLast;

  // NOTE: binary fixed point numbers
  // range: [0, 2**112 - 1]
  // resolution: 1 / 2**112
  FixedPoint.uq112x112 public price0Average;
  FixedPoint.uq112x112 public price1Average;

  // NOTE: public visibility
  // NOTE: IUniswapV2Pair
  /**
   * @dev constructor() basically initializes the values for the global variables by retrieving the current information from the token's pair at the moment of the contract's creation
   * @param _pair - This is the address of the token's pair, but it is received as an IUniswapV2Pair, by doing this is possible to make direct calls to the pair's contract  <---> _pair.functionName()
   * - If _pair were received as an address, before calling any function from the pair's contract, it would be required to cast the _pair from an address to an IUniswapV2Pair                <---> IUniswapV2Pair(_pair).functionName()
  */
  constructor(IUniswapV2Pair _pair) public {
    // If the _pair argument were an address, the below asignation would've been made like: pair = IUniswapV2Pair(_pair) <---> casting from an address to an IUniswapV2Pair
    pair = _pair;
    token0 = _pair.token0();
    token1 = _pair.token1();
    price0CumulativeLast = _pair.price0CumulativeLast();
    price1CumulativeLast = _pair.price1CumulativeLast();
    // from the getReserver() we only need the blockTimestamp, the other two returned valued can be "ignored"
    (, , blockTimestampLast) = _pair.getReserves();
  }

  function update() external {
    // Get the current values from the pair's contract
    (
      uint price0Cumulative,
      uint price1Cumulative,
      uint32 blockTimestamp
    ) = UniswapV2OracleLibrary.currentCumulativePrices(address(pair));
    // Calculate the timeElapsed since the last price's update!
    uint32 timeElapsed = blockTimestamp - blockTimestampLast;

    require(timeElapsed >= PERIOD, "time elapsed < min period");

    // NOTE: overflow is desired
    /*
    |----b-------------------------a---------|
    0                                     2**256 - 1
    b - a is preserved even if b overflows
    */
    // NOTE: uint -> uint224 cuts off the bits above uint224
    // max uint
    // 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    // max uint244
    // 0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    price0Average = FixedPoint.uq112x112(
      uint224((price0Cumulative - price0CumulativeLast) / timeElapsed)
    );
    price1Average = FixedPoint.uq112x112(
      uint224((price1Cumulative - price1CumulativeLast) / timeElapsed)
    );

    price0CumulativeLast = price0Cumulative;
    price1CumulativeLast = price1Cumulative;
    blockTimestampLast = blockTimestamp;
  }

  function consult(address token, uint amountIn) external view returns (uint amountOut) {
    require(token == token0 || token == token1, "invalid token, this Oracle is not watching for the provided token");

    if (token == token0) {
      // NOTE: using FixedPoint for *
      // NOTE: mul returns uq144x112
      // NOTE: decode144 decodes uq144x112 to uint144
      amountOut = price0Average.mul(amountIn).decode144();
    } else {
      amountOut = price1Average.mul(amountIn).decode144();
    }
  }
  
}