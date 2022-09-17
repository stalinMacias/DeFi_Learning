// contract's artifacts
const UniswapOptimal = artifacts.require("UniswapOptimal");

module.exports = async function (deployer) {
  await deployer.deploy(UniswapOptimal)
}