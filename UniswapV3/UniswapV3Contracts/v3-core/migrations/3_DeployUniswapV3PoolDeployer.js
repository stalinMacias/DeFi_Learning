/*
<-> UniswapV3PoolDeployer has no parameters!
*/


// contract's artifacts
const UniswapV3PoolDeployer = artifacts.require("UniswapV3PoolDeployer");

module.exports = async function (deployer) {
  await deployer.deploy(UniswapV3PoolDeployer)
}