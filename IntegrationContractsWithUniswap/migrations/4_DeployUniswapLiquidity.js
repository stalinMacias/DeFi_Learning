// contract's artifacts
const UniswapLiquidity = artifacts.require("UniswapLiquidity");

module.exports = async function (deployer) {
  await deployer.deploy(UniswapLiquidity)
}