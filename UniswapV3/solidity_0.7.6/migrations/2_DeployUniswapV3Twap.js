// contract's artifacts
const UniswapV3Twap = artifacts.require("UniswapV3Twap");

/*
constructor(
  address _factory,
  address _token0,
  address _token1,
  uint24 _fee
)
*/

// It was not possible to deploy the UniswapV3Factory contract because blockLimit limitations in the local blockchain!
// Thus, it is not possible to create/interact with any Pool in the V3 Protocol!!! <---> Tests only works on a fork from the mainnet network

// Uniswap Factory -> 0xC608F0718beA3563605aa652589767Cb35fcD05D

// DAI contract-> 0x1cb527Bb2e86272694019D200B7845A7c3ceA6Ca
// WETH contract -> 0xf25812889146372f9614c499228620EB7017A569

module.exports = async function (deployer) {
  await deployer.deploy(UniswapV3Twap, "0xC608F0718beA3563605aa652589767Cb35fcD05D","0x1cb527Bb2e86272694019D200B7845A7c3ceA6Ca","0xf25812889146372f9614c499228620EB7017A569","3")
}