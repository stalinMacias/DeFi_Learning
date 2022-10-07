//SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

contract UniswapV3CreatePool {
    address public immutable token0;
    address public immutable token1;
    address public immutable pool;

    constructor(
        address _factory,
        address _token0,
        address _token1,
        uint24 _fee
    ) {
        token0 = _token0;
        token1 = _token1;

        address _pool = IUniswapV3Factory(_factory).getPool(
            _token0,
            _token1,
            _fee
        );
        require(_pool != address(0), "pool doesn't exist");

        pool = _pool;
    }
}
