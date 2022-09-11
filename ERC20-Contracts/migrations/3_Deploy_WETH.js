// contract's artifacts
const WETH = artifacts.require("WETH");

module.exports = async function(deployer) {
  await deployer.deploy(WETH)
}