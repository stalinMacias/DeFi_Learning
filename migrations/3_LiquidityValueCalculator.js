// contract's artifacts
const LiquidityValueCalculator = artifacts.require("LiquidityValueCalculator");

//const FactoryContractAddress = "0x496F09eD079883D7b15ec588c2D8567F1193FBc0"

module.exports = async function (deployer) {
  await deployer.deploy(LiquidityValueCalculator, "0x208341E054c9eB3b3e42BF45857fB0593E05847a")
}